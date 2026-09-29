import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiStar,
  FiSettings,
  FiLayers,
  FiCreditCard,
  FiBell,
  FiPieChart,
  FiGrid,
  FiUser,
  FiLogOut,
  FiX,
} from 'react-icons/fi';

const Sidebar = ({ isOpen = false, onClose }) => {
  const { user, logout, isSuperAdmin, useFeature } = useAuth();
  const isStoreAdmin = user?.role === 'admin' || user?.role === 'owner' || isSuperAdmin();

  const hasAnalytics = useFeature('analytics');

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: FiHome },
    { to: '/admin/products', label: 'Products', icon: FiPackage },
    { to: '/admin/categories', label: 'Categories', icon: FiLayers },
    { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { to: '/admin/customers', label: 'Customers', icon: FiUsers },
    { to: '/admin/coupons', label: 'Coupons', icon: FiTag },
    { to: '/admin/reviews', label: 'Reviews', icon: FiStar },
    { to: '/admin/settings', label: 'Settings', icon: FiSettings },
    { to: '/admin/theme', label: 'Theme', icon: FiLayers },
    { to: '/admin/subscription', label: 'Subscription', icon: FiCreditCard },
    { to: '/admin/notifications', label: 'Notifications', icon: FiBell },
    { to: '/admin/inventory', label: 'Inventory', icon: FiPackage },
  ];

  if (hasAnalytics) {
    adminLinks.push(
      { to: '/admin/reports', label: 'Reports', icon: FiPieChart },
      { to: '/admin/activity', label: 'Activity', icon: FiPieChart }
    );
  }

  const ownerLinks = isSuperAdmin() ? [
    { to: '/owner', label: 'Platform Dashboard', icon: FiPieChart },
    { to: '/owner/stores', label: 'All Stores', icon: FiGrid },
    { to: '/owner/revenue', label: 'Revenue', icon: FiPieChart },
    { to: '/owner/global-settings', label: 'Global Settings', icon: FiSettings },
    { to: '/owner/plans', label: 'Plans', icon: FiCreditCard },
  ] : [];

  const links = isSuperAdmin() ? [...ownerLinks, ...adminLinks] : (isStoreAdmin ? adminLinks : []);

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex-shrink-0 overflow-y-auto ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
        style={{ borderColor: 'var(--color-border, #e8e4da)' }}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <span className="text-2xl font-display font-bold" style={{ color: 'var(--color-text, #1c180e)' }}>
              Drape
            </span>
            <button
              type="button"
              className="md:hidden p-2 text-secondary-500 hover:text-secondary-700 rounded-lg"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <nav className="space-y-1 flex-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-secondary-600 hover:bg-secondary-100'
                  }`
                }
                style={({ isActive }) =>
                  isActive ? { background: 'var(--color-primary-light, #fb923c)', color: 'var(--color-primary, #f97316)' } : {}
                }
              >
                <link.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{link.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 pt-8 border-t border-secondary-200">
            <NavLink
              to="/profile"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
            >
              <FiUser className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">Profile</span>
            </NavLink>
            <button
              onClick={() => {
                if (onClose) onClose();
                logout();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
            >
              <FiLogOut className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;