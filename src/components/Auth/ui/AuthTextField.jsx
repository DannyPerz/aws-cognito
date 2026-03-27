import React from 'react';

export default function AuthTextField({
  label,
  labelRight,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  inputClassName = '',
  wrapperClassName = 'space-y-1',
  labelClassName = 'text-sm font-medium text-gray-700 dark:text-gray-300 ml-1'
}) {
  return (
    <div className={wrapperClassName}>
      {(label || labelRight) && (
        <div className="flex justify-between items-center ml-1">
          {label ? <label className={labelClassName}>{label}</label> : <span />}
          {labelRight || null}
        </div>
      )}

      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />}
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClassName}
        />
      </div>
    </div>
  );
}
