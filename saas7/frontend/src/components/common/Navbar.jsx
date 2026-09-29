import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiBell, FiMenu } from 'react-icons/fi';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  return (
    <header className="bg-white border-b border-secondary-200 px-4 sm:px-6 py-3 flex items-center justify-between" style={{ borderColor: 'var(--color-border, #e8e4da)' }}>
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2.5 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Toggle navigation menu"
        >
          <FiMenu className="h-6 w-6" />
        </button>
        <h1 className="text-lg sm:text-xl font-display font-semibold truncate" style={{ color: 'var(--color-text, #1c180e)' }}>
          Dashboard
        </h1>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button className="p-2 rounded-full hover:bg-secondary-100 transition-colors relative" aria-label="Notifications">
          <FiBell className="h-5 w-5" style={{ color: 'var(--color-text, #1c180e)' }} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline text-sm text-secondary-600 truncate max-w-[120px]">{user?.name}</span>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium flex-shrink-0" style={{ background: 'var(--color-primary-light, #fb923c)', color: 'var(--color-primary, #f97316)' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
