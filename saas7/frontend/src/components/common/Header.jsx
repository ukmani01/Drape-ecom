import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../providers/ThemeProvider';
import { FiMenu, FiX, FiShoppingBag, FiUser } from 'react-icons/fi';

const Header = () => {
  const { isAuthenticated, user, logout, isSuperAdmin } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-secondary-100" style={{ borderColor: 'var(--color-border, #e8e4da)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-display font-bold text-secondary-900 tracking-tight" style={{ color: 'var(--color-text, #1c180e)' }}>
            Drape
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-secondary-600 hover:text-primary-500 transition-colors">Products</Link>
            <Link to="/about" className="text-secondary-600 hover:text-primary-500 transition-colors">About</Link>
            {isAuthenticated && isSuperAdmin() && (
              <Link to="/owner" className="text-primary-500 hover:text-primary-600 font-medium">Platform Admin</Link>
            )}
            {isAuthenticated && user?.role !== 'customer' && !isSuperAdmin() && (
              <Link to="/admin" className="text-secondary-600 hover:text-primary-500 transition-colors">Dashboard</Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 hover:bg-secondary-100 rounded-full transition-colors">
              <FiShoppingBag className="h-5 w-5" style={{ color: 'var(--color-text, #1c180e)' }} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center" style={{ background: 'var(--color-primary, #f97316)' }}>
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="p-2 hover:bg-secondary-100 rounded-full transition-colors">
                  <FiUser className="h-5 w-5" style={{ color: 'var(--color-text, #1c180e)' }} />
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-sm text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm text-secondary-600 hover:text-primary-500 transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2" style={{ background: 'var(--btn-primary-bg, #f97316)', color: 'var(--btn-primary-text, #fff)' }}>Get Started</Link>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-100">
            <nav className="flex flex-col space-y-3">
              <Link to="/products" className="text-secondary-600 hover:text-primary-500">Products</Link>
              <Link to="/about" className="text-secondary-600 hover:text-primary-500">About</Link>
              {isAuthenticated && isSuperAdmin() && (
                <Link to="/owner" className="text-primary-500 hover:text-primary-600 font-medium">Platform Admin</Link>
              )}
              {isAuthenticated && user?.role !== 'customer' && !isSuperAdmin() && (
                <Link to="/admin" className="text-secondary-600 hover:text-primary-500">Dashboard</Link>
              )}
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="text-secondary-600 hover:text-primary-500">Sign In</Link>
                  <Link to="/register" className="text-secondary-600 hover:text-primary-500">Register</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;