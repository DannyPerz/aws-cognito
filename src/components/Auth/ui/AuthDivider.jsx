import React from 'react';

export default function AuthDivider({ text = 'or continue with' }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <span className="w-1/5 border-b dark:border-gray-700"></span>
      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{text}</span>
      <span className="w-1/5 border-b dark:border-gray-700"></span>
    </div>
  );
}
