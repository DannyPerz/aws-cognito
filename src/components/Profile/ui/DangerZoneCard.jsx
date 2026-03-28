import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { PROFILE_UI } from '../constants/profileText';

export default function DangerZoneCard({ actionLoading, onGlobalSignOut }) {
  return (
    <div className="bg-red-50/50 dark:bg-red-950/20 backdrop-blur-xl border border-red-200 dark:border-red-900/50 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-2xl text-red-600 dark:text-red-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{PROFILE_UI.dangerZoneTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{PROFILE_UI.dangerZoneDescription}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 border-t border-red-200/50 dark:border-red-900/30 pt-4">
        {PROFILE_UI.dangerZoneBody}
      </p>
      <button
        onClick={onGlobalSignOut}
        disabled={actionLoading}
        className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
          <>
            <AlertTriangle className="w-5 h-5" />
            {PROFILE_UI.closeAllSessions}
          </>
        )}
      </button>
    </div>
  );
}
