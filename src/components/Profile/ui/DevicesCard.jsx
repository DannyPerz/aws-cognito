import React from 'react';
import { MonitorSmartphone, Trash2, Loader2 } from 'lucide-react';
import { PROFILE_UI } from '../constants/profileText';

export default function DevicesCard({ devicesLoading, devices, actionLoading, onForgetDevice }) {
  return (
    <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] mb-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
          <MonitorSmartphone className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{PROFILE_UI.devicesTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{PROFILE_UI.devicesDescription}</p>
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
                  {PROFILE_UI.deviceLabel} {device.attributes?.device_name || `(ID: ${device.id.substring(0, 8)}...)`}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {PROFILE_UI.lastAccess} {device.lastAuthenticatedDate ? new Date(device.lastAuthenticatedDate).toLocaleString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={() => onForgetDevice(device)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors border border-red-200 dark:border-red-900/50"
                title={PROFILE_UI.closeSessionInDeviceTitle}
              >
                <Trash2 className="w-4 h-4" /> {PROFILE_UI.unlinkDevice}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">{PROFILE_UI.noTrustedDevices}</p>
          </div>
        )}
      </div>
    </div>
  );
}
