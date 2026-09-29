import React from 'react';
import Button from './Button';

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4">
      <div className="bg-white rounded-2xl shadow-luxury p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-display font-bold text-secondary-900">Something went wrong</h2>
        <p className="text-secondary-500 mt-2">{error.message}</p>
        <Button onClick={resetErrorBoundary} className="mt-6">Try Again</Button>
      </div>
    </div>
  );
};
