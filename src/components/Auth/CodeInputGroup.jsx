import React from 'react';

export default function CodeInputGroup({
  value,
  onChange,
  length,
  idPrefix,
  inputClassName,
  containerClassName = 'flex gap-2 justify-center'
}) {
  const handleChange = (index, rawValue) => {
    let nextValue = rawValue;
    if (nextValue.length > 1) {
      nextValue = nextValue.slice(-1);
    }

    const nextCode = [...value];
    nextCode[index] = nextValue;
    onChange(nextCode);

    if (nextValue !== '' && index < length - 1) {
      const nextInput = document.getElementById(`${idPrefix}-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      const prevInput = document.getElementById(`${idPrefix}-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '');
    if (!pastedData) return;

    const pastedArray = pastedData.slice(0, length).split('');
    const nextCode = [...value];

    let lastFilledIndex = 0;
    for (let i = 0; i < pastedArray.length; i++) {
      nextCode[i] = pastedArray[i];
      lastFilledIndex = i;
    }

    onChange(nextCode);

    const nextIndex = lastFilledIndex < length - 1 ? lastFilledIndex + 1 : length - 1;
    const nextInput = document.getElementById(`${idPrefix}-${nextIndex}`);
    if (nextInput) nextInput.focus();
  };

  return (
    <div className={containerClassName}>
      {value.slice(0, length).map((digit, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={inputClassName}
        />
      ))}
    </div>
  );
}
