import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PROFILE_UI } from '../constants/profileText';

export default function ProfileHeader({ onBack }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={onBack}
        className="p-2 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-gray-800 hover:scale-110 active:scale-95 transition-all"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
          {PROFILE_UI.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{PROFILE_UI.subtitle}</p>
      </div>
    </div>
  );
}
