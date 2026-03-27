import { useState } from 'react';
import { signIn, confirmSignIn, rememberDevice } from 'aws-amplify/auth';
import { LOGIN_FLOW_TEXT } from '../components/Auth/constants/authText';
import {
  AUTH_METHODS,
  COGNITO_FACTORS,
  COGNITO_SIGN_IN_STEPS,
  LOGIN_STEPS
} from '../components/Auth/constants/authState';

export default function useLoginFlow({ onLoginSuccess }) {
  const [step, setStep] = useState(LOGIN_STEPS.LOGIN);
  const [activeMethod, setActiveMethod] = useState(null);

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
    if (nextStep.signInStep === COGNITO_SIGN_IN_STEPS.CONTINUE_TOTP_SETUP) {
      const totpSetupDetails = nextStep.totpSetupDetails;
      const appName = LOGIN_FLOW_TEXT.appName;
      const setupUri = totpSetupDetails.getSetupUri(appName).toString();
      setQrUri(setupUri);
      setStep(LOGIN_STEPS.SETUP_TOTP);
      return;
    }

    if (nextStep.signInStep === COGNITO_SIGN_IN_STEPS.CONFIRM_TOTP_CODE) {
      setStep(LOGIN_STEPS.CONFIRM_TOTP);
      return;
    }

    if (nextStep.signInStep === COGNITO_SIGN_IN_STEPS.CONFIRM_OTP_CODE || nextStep.signInStep === COGNITO_SIGN_IN_STEPS.CONFIRM_EMAIL_CODE) {
      if (method === AUTH_METHODS.PASSWORD) {
        setError(LOGIN_FLOW_TEXT.emailCodeUnexpectedForPassword);
        return;
      }
      setStep(LOGIN_STEPS.CONFIRM_EMAIL_OTP);
      return;
    }

    if (nextStep.signInStep === COGNITO_SIGN_IN_STEPS.CONTINUE_FIRST_FACTOR_SELECTION) {
      const available = nextStep.availableFactors || [];

      try {
        if (method === AUTH_METHODS.PASSWORD) {
          const passChallenge = available.includes(COGNITO_FACTORS.PASSWORD_SRP)
            ? COGNITO_FACTORS.PASSWORD_SRP
            : (available.includes(COGNITO_FACTORS.PASSWORD) ? COGNITO_FACTORS.PASSWORD : null);
          if (!passChallenge) {
            setError(LOGIN_FLOW_TEXT.missingPasswordFactor);
            return;
          }
          const { nextStep: advancedStep } = await confirmSignIn({ challengeResponse: passChallenge });
          await handleNextStep(advancedStep, method);
          return;
        }

        if (method === AUTH_METHODS.EMAIL_OTP) {
          if (!available.includes(COGNITO_FACTORS.EMAIL_OTP)) {
            setError(LOGIN_FLOW_TEXT.emailOtpDisabled);
            setStep(LOGIN_STEPS.LOGIN_PASSWORD);
            return;
          }
          const { nextStep: advancedStep } = await confirmSignIn({ challengeResponse: COGNITO_FACTORS.EMAIL_OTP });
          await handleNextStep(advancedStep, method);
          return;
        }
      } catch (err) {
        setError(LOGIN_FLOW_TEXT.factorSelectionError(err.message));
      }
      return;
    }

    if (nextStep.signInStep === COGNITO_SIGN_IN_STEPS.CONTINUE_MFA_SELECTION) {
      try {
        const { nextStep: advancedStep } = await confirmSignIn({ challengeResponse: COGNITO_FACTORS.TOTP });
        await handleNextStep(advancedStep, method);
      } catch (err) {
        setError(LOGIN_FLOW_TEXT.mfaSelectionError(err.message));
      }
      return;
    }

    setError(LOGIN_FLOW_TEXT.unsupportedChallenge(nextStep.signInStep));
  };

  const handleSignIn = async (method) => {
    if (!email) {
      setError(LOGIN_FLOW_TEXT.emailRequired);
      return;
    }

    if (method === AUTH_METHODS.PASSWORD && !password) {
      setError(LOGIN_FLOW_TEXT.passwordRequired);
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
              preferredChallenge: AUTH_METHODS.EMAIL_OTP
            }
          };

      const { isSignedIn, nextStep } = await signIn(signInParams);

      if (isSignedIn) {
        if (rememberDeviceChecked && method === AUTH_METHODS.PASSWORD) {
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
      setError(err.message || LOGIN_FLOW_TEXT.signInError);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMFA = async () => {
    setLoading(true);
    setError('');

    const codeLen = step === LOGIN_STEPS.CONFIRM_EMAIL_OTP ? 8 : 6;

    try {
      const challengeResponse = mfaCode.slice(0, codeLen).join('');
      const { isSignedIn, nextStep } = await confirmSignIn({ challengeResponse });

      if (isSignedIn) {
        if (rememberDeviceChecked && activeMethod === AUTH_METHODS.PASSWORD) {
          try {
            await rememberDevice();
          } catch (err) {
            console.warn('No se pudo recordar disp:', err);
          }
        }
        onLoginSuccess();
      } else {
        setError(LOGIN_FLOW_TEXT.remainingStep(nextStep.signInStep));
      }
    } catch (err) {
      const errMsg = err?.message || LOGIN_FLOW_TEXT.invalidMfaCode;

      if (
        step === LOGIN_STEPS.CONFIRM_EMAIL_OTP &&
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
            setError(LOGIN_FLOW_TEXT.remainingStep(nextStep.signInStep));
          }
          return;
        } catch (retryErr) {
          setError((retryErr && retryErr.message) || LOGIN_FLOW_TEXT.emailOtpRetryError);
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
