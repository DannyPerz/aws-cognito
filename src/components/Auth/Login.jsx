import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, QrCode } from 'lucide-react';
import { signIn, signInWithRedirect, confirmSignIn } from 'aws-amplify/auth';
import { QRCodeSVG } from 'qrcode.react';

export default function Login({ onNavigate, onLoginSuccess }) {
  const [step, setStep] = useState('login'); // 'login' | 'setup-totp' | 'confirm-totp'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [qrUri, setQrUri] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      if (isSignedIn) {
        onLoginSuccess();
      } else {
        handleNextStep(nextStep);
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (nextStep) => {
    if (nextStep.signInStep === 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP') {
      // Los datos del TOTP vienen DENTRO del nextStep, no se necesita llamar a setUpTOTP()
      const totpSetupDetails = nextStep.totpSetupDetails;
      const appName = 'MyReactApp';
      const setupUri = totpSetupDetails.getSetupUri(appName).toString();
      setQrUri(setupUri);
      setStep('setup-totp');
    } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
      setStep('confirm-totp');
    } else if (nextStep.signInStep === 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION') {
      // Si Cognito pide seleccionar el tipo de MFA
      confirmSignIn({ challengeResponse: 'TOTP' })
        .then(({ nextStep: advancedStep }) => handleNextStep(advancedStep))
        .catch((err) => setError(`Error seleccionando MFA: ${err.message}`));
    } else {
      setError(`Reto no soportado en este demo: ${nextStep.signInStep}`);
    }
  };

  const handleConfirmMFA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const challengeResponse = mfaCode.join('');
      const { isSignedIn, nextStep } = await confirmSignIn({ challengeResponse });
      
      if (isSignedIn) {
        onLoginSuccess();
      } else {
        setError(`Aún falta un paso: ${nextStep.signInStep}`);
      }
    } catch (err) {
      setError(err.message || 'Código MFA inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...mfaCode];
    newCode[index] = value;
    setMfaCode(newCode);

    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`mfa-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Vistas de MFA
  if (step === 'setup-totp' || step === 'confirm-totp') {
    return (
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
            {step === 'setup-totp' ? <QrCode className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {step === 'setup-totp' ? 'Configura tu MFA' : 'Autenticación en 2 Pasos'}
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            {step === 'setup-totp' 
              ? 'Escanea este QR con Google Authenticator o Authy, y digita el código de 6 números que se genera.'
              : 'Ingresa el código de 6 dígitos que aparece en tu aplicación de autenticación dinámica.'}
          </p>

          {step === 'setup-totp' && qrUri && (
            <div className="flex justify-center mb-6 p-4 bg-white rounded-xl mx-auto w-max shadow-sm border border-gray-100">
              <QRCodeSVG value={qrUri} size={150} />
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100/50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleConfirmMFA}>
            <div className="flex gap-2 justify-center">
              {mfaCode.map((digit, i) => (
                <input 
                  key={i}
                  id={`mfa-${i}`}
                  type="text" 
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-bold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
              ))}
            </div>

            <button 
              disabled={loading || mfaCode.some(c => c === '')}
              className="w-full py-3 mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verificar e Ingresar'}
            </button>
            <button 
              type="button"
              onClick={() => setStep('login')}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100/50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSignIn}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b dark:border-gray-700"></span>
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">or continue with</span>
          <span className="w-1/5 border-b dark:border-gray-700"></span>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => signInWithRedirect({ provider: 'Google' })}
            type="button"
            className="w-full py-3 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Sign in with Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button onClick={onNavigate} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
