import React from 'react';

export default function AuthCheckboxField({ id, checked, onChange, label }) {
  return (
    <div className="flex items-center gap-2 mt-4 ml-1 mb-2">
      <input
        type="checkbox"
        id={id}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={id} className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
}
