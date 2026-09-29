import React from 'react';
import clsx from 'clsx';

const Select = ({
  label,
  error,
  options,
  className,
  register,
  name,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={name}
        {...register?.(name)}
        className={clsx(
          'input-luxury',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
