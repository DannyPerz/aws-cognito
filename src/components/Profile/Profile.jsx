import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldOff, QrCode, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { setUpTOTP, verifyTOTPSetup, updateMFAPreference, fetchMFAPreference } from 'aws-amplify/auth';
import { QRCodeSVG } from 'qrcode.react';

export default function Profile({ onBack }) {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Setup flow
  const [setupStep, setSetupStep] = useState('idle'); // 'idle' | 'qr' | 'verify'
  const [qrUri, setQrUri] = useState('');
  const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', '']);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const mfaPreference = await fetchMFAPreference();
      const isEnabled = mfaPreference?.preferred === 'TOTP' || mfaPreference?.enabled?.includes('TOTP');
      setMfaEnabled(!!isEnabled);
    } catch (err) {
      console.error('Error checking MFA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const totpSetup = await setUpTOTP();
      const appName = 'MyReactApp';
      setQrUri(totpSetup.getSetupUri(appName).toString());
      setSetupStep('qr');
    } catch (err) {
      setError('Error iniciando configuración MFA: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyTOTP = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      const code = verifyCode.join('');
      await verifyTOTPSetup({ code });
      await updateMFAPreference({ totp: 'PREFERRED' });
      setMfaEnabled(true);
      setSetupStep('idle');
      setSuccess('¡MFA habilitado correctamente! Tu cuenta ahora tiene doble protección. 🛡️');
    } catch (err) {
      setError('Código inválido: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateMFAPreference({ totp: 'DISABLED' });
      setMfaEnabled(false);
      setSuccess('MFA deshabilitado correctamente.');
    } catch (err) {
      setError('Error deshabilitando MFA: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...verifyCode];
    newCode[index] = value;
    setVerifyCode(newCode);
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`profile-mfa-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-gray-800 hover:scale-110 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            Seguridad de la Cuenta
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Administra la autenticación de dos factores (MFA)</p>
        </div>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-2xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* MFA Status Card */}
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${mfaEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
              {mfaEnabled ? <ShieldCheck className="w-7 h-7" /> : <ShieldOff className="w-7 h-7" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Autenticación TOTP
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mfaEnabled 
                  ? 'MFA activado — Tu cuenta está protegida con verificación en 2 pasos'
                  : 'MFA desactivado — Activa la verificación en 2 pasos para mayor seguridad'}
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${mfaEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
            {mfaEnabled ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Setup QR Step */}
        {setupStep === 'qr' && (
          <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-4 animate-in fade-in duration-300">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Escanea el código QR</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Abre Google Authenticator o Authy y escanea este código. Luego ingresa los 6 dígitos que te genera la app.
              </p>

              {qrUri && (
                <div className="flex justify-center mb-6 p-4 bg-white rounded-xl mx-auto w-max shadow-sm border border-gray-100">
                  <QRCodeSVG value={qrUri} size={180} />
                </div>
              )}

              <form onSubmit={handleVerifyTOTP} className="space-y-4">
                <div className="flex gap-2 justify-center">
                  {verifyCode.map((digit, i) => (
                    <input
                      key={i}
                      id={`profile-mfa-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-bold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  ))}
                </div>
                <div className="flex gap-3 justify-center mt-6">
                  <button
                    type="button"
                    onClick={() => { setSetupStep('idle'); setError(''); }}
                    className="px-6 py-3 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || verifyCode.some(c => c === '')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {actionLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Verificar y Activar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {setupStep === 'idle' && (
          <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-4">
            {mfaEnabled ? (
              <button
                onClick={handleDisableMFA}
                disabled={actionLoading}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                  <>
                    <ShieldOff className="w-5 h-5" />
                    Deshabilitar MFA
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleEnableMFA}
                disabled={actionLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Habilitar MFA
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
