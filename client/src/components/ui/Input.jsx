import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      wrapperClassName = '',
      required = false,
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
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Icon className="w-5 h-5" />
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={`w-full font-body rounded-xl border bg-white px-4 py-2.5 sm:py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              Icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-brandRed focus:border-brandRed focus:ring-brandRed/20'
                : 'border-gray-200 hover:border-gray-300 focus:border-primary'
            } ${className}`}
            {...props}
          />
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

Input.displayName = 'Input';

export default Input;
