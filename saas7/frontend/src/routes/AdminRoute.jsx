import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (typeof isAdmin === 'function' && !isAdmin()) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminRoute;