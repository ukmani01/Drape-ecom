import React from 'react';
import clsx from 'clsx';

const Input = ({
  label,
  error,
  className,
  register,   // can be function or result object
  name,
  value,
  onChange,
  ...props
}) => {
  // If register is a function, call it with name
  // If register is an object (result of register()), use it directly
  let inputProps = {};
  if (typeof register === 'function') {
    inputProps = register(name);
  } else if (register && typeof register === 'object') {
    // If register is already the result object (from {...register('name')})
    inputProps = register;
  } else {
    // fallback to controlled mode
    inputProps = { value: value || '', onChange };
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        {...inputProps}
        {...props}
        className={clsx(
          'input-luxury',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;