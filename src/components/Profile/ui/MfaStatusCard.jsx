import React from 'react';
import { ShieldCheck, ShieldOff, QrCode, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CodeInputGroup from '../../Auth/CodeInputGroup';
import { PROFILE_UI } from '../constants/profileText';

export default function MfaStatusCard({
  isGoogleUser,
  mfaEnabled,
  setupStep,
  setupSteps,
  qrUri,
  verifyCode,
  setVerifyCode,
  actionLoading,
  onCancelSetup,
  onVerifySetup,
  onEnableMfa,
  onDisableMfa
}) {
  return (
    <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${mfaEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
            {mfaEnabled ? <ShieldCheck className="w-7 h-7" /> : <ShieldOff className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{PROFILE_UI.mfaTitle}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isGoogleUser
                ? PROFILE_UI.mfaDescriptionGoogle
                : mfaEnabled
                  ? PROFILE_UI.mfaDescriptionEnabled
                  : PROFILE_UI.mfaDescriptionDisabled}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isGoogleUser ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : mfaEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
          {isGoogleUser ? PROFILE_UI.mfaStatusGoogle : mfaEnabled ? PROFILE_UI.mfaStatusEnabled : PROFILE_UI.mfaStatusDisabled}
        </span>
      </div>

      {isGoogleUser && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-4">
          <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-sm text-blue-700 dark:text-blue-300">
            {PROFILE_UI.mfaGoogleNotice}
          </div>
        </div>
      )}

      {!isGoogleUser && setupStep === setupSteps.QR && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-4 animate-in fade-in duration-300">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{PROFILE_UI.qrTitle}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{PROFILE_UI.qrDescription}</p>

            {qrUri && (
              <div className="flex justify-center mb-6 p-4 bg-white rounded-xl mx-auto w-max shadow-sm border border-gray-100">
                <QRCodeSVG value={qrUri} size={180} />
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); onVerifySetup(); }} className="space-y-4">
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
                  onClick={onCancelSetup}
                  className="px-6 py-3 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
                >
                  {PROFILE_UI.cancel}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || verifyCode.some((c) => c === '')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  {actionLoading ? <Loader2 className="animate-spin h-4 w-4" /> : PROFILE_UI.verifyAndEnable}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isGoogleUser && setupStep === setupSteps.IDLE && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-4">
          {mfaEnabled ? (
            <button
              onClick={onDisableMfa}
              disabled={actionLoading}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  <ShieldOff className="w-5 h-5" />
                  {PROFILE_UI.disableMfa}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onEnableMfa}
              disabled={actionLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  {PROFILE_UI.enableMfa}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
