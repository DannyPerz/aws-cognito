import React from 'react';

export default function AuthErrorMessage({ message, className = '' }) {
  if (!message) return null;

  const baseClassName = 'mb-4 p-3 bg-red-100/50 border border-red-200 text-red-600 rounded-xl text-sm text-center';
  return <div className={`${baseClassName} ${className}`.trim()}>{message}</div>;
}
