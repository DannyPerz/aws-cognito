import React from 'react';
import { ShieldCheck, ShieldOff, QrCode, Loader2, ArrowLeft, CheckCircle2, MonitorSmartphone, Trash2, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CodeInputGroup from '../Auth/CodeInputGroup';
import useProfileSecurity from '../../hooks/useProfileSecurity';

export default function Profile({ onBack, isGoogleUser = false }) {
  const {
    PROFILE_SETUP_STEPS,
    mfaEnabled,
    loading,
    actionLoading,
    error,
    success,
    setupStep,
    setSetupStep,
    qrUri,
    verifyCode,
    setVerifyCode,
    devices,
    devicesLoading,
    setError,
    handleEnableMFA,
    handleVerifyTOTP,
    handleDisableMFA,
    handleForgetDevice,
    handleGlobalSignOut
  } = useProfileSecurity();

  if (loading && !devices.length) {
    return (
      <div className="w-full max-w-2xl flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
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
          <p className="text-gray-500 dark:text-gray-400 text-sm">Administra MFA y sesiones activas</p>
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
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] mb-6">
        
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
                {isGoogleUser
                  ? 'Tu cuenta está protegida por Google. Gestiona tu seguridad desde tu cuenta de Google.'
                  : mfaEnabled 
                  ? 'MFA activado — Tu cuenta está protegida con verificación en 2 pasos'
                  : 'MFA opcional — Activa la verificación en 2 pasos para mayor seguridad'}
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isGoogleUser ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : mfaEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
            {isGoogleUser ? 'Google' : mfaEnabled ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {isGoogleUser && (
          <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-4">
            <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-sm text-blue-700 dark:text-blue-300">
              Tu cuenta está protegida por Google. Gestiona tu seguridad en tu cuenta de Google.
            </div>
          </div>
        )}

        {/* Setup QR Step */}
        {!isGoogleUser && setupStep === PROFILE_SETUP_STEPS.QR && (
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

              <form onSubmit={(e) => { e.preventDefault(); handleVerifyTOTP(); }} className="space-y-4">
                <CodeInputGroup
                  value={verifyCode}
                  onChange={setVerifyCode}
                  length={6}
                  idPrefix="profile-mfa"
                  inputClassName="w-12 h-14 text-center text-xl font-bold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
                <div className="flex gap-3 justify-center mt-6">
                  <button
                    type="button"
                    onClick={() => { setSetupStep(PROFILE_SETUP_STEPS.IDLE); setError(''); }}
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
        {!isGoogleUser && setupStep === PROFILE_SETUP_STEPS.IDLE && (
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

      {/* Device Tracking Card */}
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <MonitorSmartphone className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dispositivos Vinculados
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiones las sesiones activas asociadas a tu cuenta.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {devicesLoading ? (
            <div className="flex justify-center py-8">
               <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
            </div>
          ) : devices.length > 0 ? (
            devices.map((device, idx) => (
              <div key={device.id || idx} className="flex flex-wrap sm:flex-nowrap justify-between items-center p-4 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-2xl gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    Dispositivo {device.attributes?.device_name || `(ID: ${device.id.substring(0, 8)}...)`}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Último acceso: {device.lastAuthenticatedDate ? new Date(device.lastAuthenticatedDate).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => handleForgetDevice(device)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors border border-red-200 dark:border-red-900/50"
                  title="Cerrar sesión en este dispositivo"
                >
                  <Trash2 className="w-4 h-4" /> Desvincular
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cognito no tiene registrado ningún equipo confiable.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-red-950/20 backdrop-blur-xl border border-red-200 dark:border-red-900/50 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
           <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-2xl text-red-600 dark:text-red-400">
             <AlertTriangle className="w-7 h-7" />
           </div>
           <div>
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
               Zona de Peligro
             </h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">
               Administra la seguridad global de tu cuenta.
             </p>
           </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 border-t border-red-200/50 dark:border-red-900/30 pt-4">
          Si dejaste tu cuenta abierta en un dispositivo público (como un cibercafé) y no recuerdas haber cerrado sesión, puedes revocar inmediatamente los accesos de **TODOS** los dispositivos del mundo haciendo click aquí. Esto también cerrará tu sesión actual.
        </p>
        <button
          onClick={handleGlobalSignOut}
          disabled={actionLoading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
            <>
              <AlertTriangle className="w-5 h-5" />
              Cerrar sesión en TODOS los dispositivos
            </>
          )}
        </button>
      </div>

    </div>
  );
}
