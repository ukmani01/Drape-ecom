import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-luxury overflow-hidden transition-shadow duration-300',
        {
          'hover:shadow-luxury-hover': hover,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => (
  <div className={clsx('px-6 pt-6 pb-4 border-b border-secondary-100', className)}>{children}</div>
);

export const CardBody = ({ children, className }) => (
  <div className={clsx('p-6', className)}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={clsx('px-6 py-4 bg-secondary-50/50 border-t border-secondary-100', className)}>{children}</div>
);

export default Card;
