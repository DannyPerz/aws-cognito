import React from 'react';

export default function AuthPanel({ children, className = '' }) {
  const baseClassName = 'bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]';
  return <div className={`${baseClassName} ${className}`.trim()}>{children}</div>;
}
