import React from 'react';

export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h3 className="text-xl font-display font-semibold text-secondary-900">{title}</h3>
      {description && <p className="text-secondary-500 mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
