import React, { forwardRef } from 'react';

const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      className = '',
      wrapperClassName = '',
      required = false,
      placeholder = 'Select an option',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${wrapperClassName}`}>
        {label && (
          <label className="block text-sm font-bold text-gray-700 mb-1.5 font-body">
            {label} {required && <span className="text-brandRed">*</span>}
          </label>
        )}

        <div className="relative rounded-2xl shadow-sm">
          <select
            ref={ref}
            className={`w-full appearance-none font-body rounded-xl border bg-white px-4 py-2.5 sm:py-3 pr-10 text-sm text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              error
                ? 'border-brandRed focus:border-brandRed focus:ring-brandRed/20'
                : 'border-gray-200 hover:border-gray-300 focus:border-primary'
            } ${className}`}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => {
              const value = typeof opt === 'object' ? opt.value : opt;
              const labelText = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={value} value={value}>
                  {labelText}
                </option>
              );
            })}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-xs font-semibold text-brandRed font-body flex items-center gap-1">
            <span>•</span> {error}
          </p>
        )}

        {!error && helperText && (
          <p className="mt-1 text-xs text-gray-500 font-body">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
