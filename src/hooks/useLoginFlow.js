import { useState } from 'react';
import { signIn, confirmSignIn, rememberDevice } from 'aws-amplify/auth';

export default function useLoginFlow({ onLoginSuccess }) {
  const [step, setStep] = useState('login'); // 'login' | 'setup-totp' | 'confirm-totp'
  const [activeMethod, setActiveMethod] = useState(null); // 'PASSWORD' | 'EMAIL_OTP'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '', '', '']);
  const [qrUri, setQrUri] = useState('');

  const [rememberDeviceChecked, setRememberDeviceChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [didRetryEmailOtpWithoutDeviceKey, setDidRetryEmailOtpWithoutDeviceKey] = useState(false);

  const clearStaleDeviceMetadata = () => {
    const keyMatchers = [/CognitoIdentityServiceProvider\./, /deviceKey|deviceGroupKey|randomPasswordKey/i];
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (keyMatchers[0].test(key) && keyMatchers[1].test(key)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  };

  const handleNextStep = async (nextStep, method = activeMethod) => {
    if (nextStep.signInStep === 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP') {
      const totpSetupDetails = nextStep.totpSetupDetails;
      const appName = 'MyReactApp';
      const setupUri = totpSetupDetails.getSetupUri(appName).toString();
      setQrUri(setupUri);
      setStep('setup-totp');
      return;
    }

    if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
      setStep('confirm-totp');
      return;
    }

    if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_OTP_CODE' || nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
      if (method === 'PASSWORD') {
        setError('Login con contraseña no debería pedir código por correo. Revisa en Cognito que no tengas MFA por email activo para este usuario.');
        return;
      }
      setStep('confirm-email-otp');
      return;
    }

    if (nextStep.signInStep === 'CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION') {
      const available = nextStep.availableFactors || [];

      try {
        if (method === 'PASSWORD') {
          const passChallenge = available.includes('PASSWORD_SRP') ? 'PASSWORD_SRP' : (available.includes('PASSWORD') ? 'PASSWORD' : null);
          if (!passChallenge) {
            setError('Tu pool no ofrece factor de contraseña en este flujo.');
            return;
          }
          const { nextStep: advancedStep } = await confirmSignIn({ challengeResponse: passChallenge });
          await handleNextStep(advancedStep, method);
          return;
        }

        if (method === 'EMAIL_OTP') {
          if (!available.includes('EMAIL_OTP')) {
            setError('El inicio por correo está deshabilitado para esta cuenta. Usa contraseña.');
            setStep('login-password');
            return;
          }
          const { nextStep: advancedStep } = await confirmSignIn({ challengeResponse: 'EMAIL_OTP' });
          await handleNextStep(advancedStep, method);
          return;
        }
      } catch (err) {
        setError(`Error seleccionando factor: ${err.message}`);
      }
      return;
    }

    if (nextStep.signInStep === 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION') {
      try {
        const { nextStep: advancedStep } = await confirmSignIn({ challengeResponse: 'TOTP' });
        await handleNextStep(advancedStep, method);
      } catch (err) {
        setError(`Error seleccionando MFA: ${err.message}`);
      }
      return;
    }

    setError(`Reto no validado en UI: ${nextStep.signInStep}`);
  };

  const handleSignIn = async (method) => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico primero.');
      return;
    }

    if (method === 'PASSWORD' && !password) {
      setError('Por favor, ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    setError('');
    setActiveMethod(method);
    setDidRetryEmailOtpWithoutDeviceKey(false);

    try {
      const signInParams = method === 'PASSWORD'
        ? {
            username: email,
            password,
            options: {
              authFlowType: 'USER_SRP_AUTH'
            }
          }
        : {
            username: email,
            options: {
              authFlowType: 'USER_AUTH',
              preferredChallenge: 'EMAIL_OTP'
            }
          };

      const { isSignedIn, nextStep } = await signIn(signInParams);

      if (isSignedIn) {
        if (rememberDeviceChecked && method === 'PASSWORD') {
          try {
            await rememberDevice();
          } catch (err) {
            console.warn('No se pudo recordar disp:', err);
          }
        }
        onLoginSuccess();
        return;
      }

      await handleNextStep(nextStep, method);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMFA = async () => {
    setLoading(true);
    setError('');

    const codeLen = step === 'confirm-email-otp' ? 8 : 6;

    try {
      const challengeResponse = mfaCode.slice(0, codeLen).join('');
      const { isSignedIn, nextStep } = await confirmSignIn({ challengeResponse });

      if (isSignedIn) {
        if (rememberDeviceChecked && activeMethod === 'PASSWORD') {
          try {
            await rememberDevice();
          } catch (err) {
            console.warn('No se pudo recordar disp:', err);
          }
        }
        onLoginSuccess();
      } else {
        setError(`Aún falta un paso: ${nextStep.signInStep}`);
      }
    } catch (err) {
      const errMsg = err?.message || 'Código MFA inválido';

      if (
        step === 'confirm-email-otp' &&
        /Device does not exist/i.test(errMsg) &&
        !didRetryEmailOtpWithoutDeviceKey
      ) {
        try {
          clearStaleDeviceMetadata();
          setDidRetryEmailOtpWithoutDeviceKey(true);

          const challengeResponse = mfaCode.slice(0, codeLen).join('');
          const { isSignedIn, nextStep } = await confirmSignIn({ challengeResponse });

          if (isSignedIn) {
            onLoginSuccess();
          } else {
            setError(`Aún falta un paso: ${nextStep.signInStep}`);
          }
          return;
        } catch (retryErr) {
          setError((retryErr && retryErr.message) || 'No se pudo verificar el código de correo tras limpiar el dispositivo local.');
          return;
        }
      }

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    email,
    setEmail,
    password,
    setPassword,
    mfaCode,
    setMfaCode,
    qrUri,
    rememberDeviceChecked,
    setRememberDeviceChecked,
    loading,
    error,
    handleSignIn,
    handleConfirmMFA
  };
}
