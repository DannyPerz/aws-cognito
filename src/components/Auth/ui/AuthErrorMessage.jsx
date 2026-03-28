import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorMessage({ message, className = '' }) {
  if (!message) return null;

  const baseClassName = 'mb-4 p-3 rounded-xl border shadow-sm bg-red-50 border-red-300 text-red-800 dark:bg-red-950/60 dark:border-red-700 dark:text-red-100';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`${baseClassName} ${className}`.trim()}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p className="text-sm leading-5">{message}</p>
      </div>
    </div>
  );
}
