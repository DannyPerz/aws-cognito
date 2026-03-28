import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ProfileFeedback({ error, success }) {
  return (
    <>
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
    </>
  );
}
