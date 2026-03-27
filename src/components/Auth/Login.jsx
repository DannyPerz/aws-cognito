import React from 'react';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, QrCode } from 'lucide-react';
import { signInWithRedirect } from 'aws-amplify/auth';
import { QRCodeSVG } from 'qrcode.react';
import CodeInputGroup from './CodeInputGroup';
import useLoginFlow from '../../hooks/useLoginFlow';
import AuthPanel from './ui/AuthPanel';
import AuthErrorMessage from './ui/AuthErrorMessage';
import AuthDivider from './ui/AuthDivider';
import AuthTextField from './ui/AuthTextField';
import { LOGIN_UI } from './constants/authText';
import { AUTH_METHODS, LOGIN_STEPS } from './constants/authState';

export default function Login({ onNavigate, onLoginSuccess }) {
  const {
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
  } = useLoginFlow({ onLoginSuccess });

  // Vistas secundarias
  if (step === LOGIN_STEPS.SETUP_TOTP || step === LOGIN_STEPS.CONFIRM_TOTP || step === LOGIN_STEPS.CONFIRM_EMAIL_OTP) {
    return (
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <AuthPanel className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
            {step === LOGIN_STEPS.SETUP_TOTP ? <QrCode className="w-8 h-8" /> : (step === LOGIN_STEPS.CONFIRM_EMAIL_OTP ? <Mail className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />)}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {step === LOGIN_STEPS.SETUP_TOTP ? LOGIN_UI.setupTotpTitle : (step === LOGIN_STEPS.CONFIRM_EMAIL_OTP ? LOGIN_UI.confirmEmailOtpTitle : LOGIN_UI.confirmTotpTitle)}
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            {step === LOGIN_STEPS.SETUP_TOTP 
              ? LOGIN_UI.setupTotpDescription
              : (step === LOGIN_STEPS.CONFIRM_EMAIL_OTP 
                  ? LOGIN_UI.confirmEmailOtpDescription(email)
                  : LOGIN_UI.confirmTotpDescription)}
          </p>

          {step === LOGIN_STEPS.SETUP_TOTP && qrUri && (
            <div className="flex justify-center mb-6 p-4 bg-white rounded-xl mx-auto w-max shadow-sm border border-gray-100">
              <QRCodeSVG value={qrUri} size={150} />
            </div>
          )}

          <AuthErrorMessage message={error} className="text-left" />
          
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleConfirmMFA(); }}>
            <CodeInputGroup
              value={mfaCode}
              onChange={setMfaCode}
              length={step === LOGIN_STEPS.CONFIRM_EMAIL_OTP ? 8 : 6}
              idPrefix="mfa"
              inputClassName={`text-center font-bold bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none transition-all ${
                step === LOGIN_STEPS.CONFIRM_EMAIL_OTP ? 'w-10 h-12 text-lg' : 'w-12 h-14 text-xl'
              }`}
            />

            <button 
              disabled={loading || mfaCode.slice(0, step === LOGIN_STEPS.CONFIRM_EMAIL_OTP ? 8 : 6).some(c => c === '')}
              className="w-full py-3 mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : LOGIN_UI.verifyAndEnter}
            </button>
            <button 
              type="button"
              onClick={() => setStep(LOGIN_STEPS.LOGIN)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {LOGIN_UI.cancel}
            </button>
            {step === LOGIN_STEPS.CONFIRM_EMAIL_OTP && (
              <button 
                type="button"
                onClick={() => setStep(LOGIN_STEPS.LOGIN_PASSWORD)}
                className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors"
              >
                {LOGIN_UI.switchToPassword}
              </button>
            )}
          </form>
        </AuthPanel>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AuthPanel>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            {LOGIN_UI.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {LOGIN_UI.subtitle}
          </p>
        </div>

        <AuthErrorMessage message={error} />

        {step === LOGIN_STEPS.LOGIN && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignIn(AUTH_METHODS.EMAIL_OTP); }}>
            <AuthTextField
              label={LOGIN_UI.emailLabel}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={LOGIN_UI.emailPlaceholder}
              icon={Mail}
              inputClassName="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 outline-none transition-all text-gray-900 dark:text-white"
            />

            <div className="flex items-center gap-2 mt-4 ml-1 mb-2">
              <input 
                type="checkbox" 
                id="remember_otp" 
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                checked={rememberDeviceChecked}
                onChange={(e) => setRememberDeviceChecked(e.target.checked)}
              />
              <label htmlFor="remember_otp" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                {LOGIN_UI.rememberOtp}
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : LOGIN_UI.continue}
              {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
            
            <button 
              type="button"
              onClick={() => setStep(LOGIN_STEPS.LOGIN_PASSWORD)}
              className="w-full py-3 mt-2 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 rounded-xl font-medium flex items-center justify-center transition-all active:scale-[0.98] text-sm"
            >
              {LOGIN_UI.switchToPassword}
            </button>
          </form>
        )}

        {step === LOGIN_STEPS.LOGIN_PASSWORD && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignIn(AUTH_METHODS.PASSWORD); }}>
            <AuthTextField
              label={LOGIN_UI.emailLabel}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={LOGIN_UI.emailPlaceholder}
              icon={Mail}
              inputClassName="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            />

            <AuthTextField
              label={LOGIN_UI.passwordLabel}
              labelRight={<a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{LOGIN_UI.forgotPassword}</a>}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={LOGIN_UI.passwordPlaceholder}
              icon={Lock}
              inputClassName="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            />

            <div className="flex items-center gap-2 mt-4 ml-1 mb-2">
              <input 
                type="checkbox" 
                id="remember_pwd" 
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                checked={rememberDeviceChecked}
                onChange={(e) => setRememberDeviceChecked(e.target.checked)}
              />
              <label htmlFor="remember_pwd" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                {LOGIN_UI.rememberPassword}
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : LOGIN_UI.enter}
              {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            <button 
              type="button"
              onClick={() => setStep(LOGIN_STEPS.LOGIN)}
              className="w-full py-3 mt-2 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 rounded-xl font-medium flex items-center justify-center transition-all active:scale-[0.98] text-sm"
            >
              {LOGIN_UI.switchToPasswordless}
            </button>
          </form>
        )}

        <AuthDivider text={LOGIN_UI.divider} />

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
            {LOGIN_UI.googleSignIn}
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          {LOGIN_UI.noAccount}{' '}
          <button onClick={onNavigate} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {LOGIN_UI.signUp}
          </button>
        </p>
      </AuthPanel>
    </div>
  );
}
