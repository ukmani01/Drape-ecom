import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OwnerRoute = () => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // ✅ Only Super Admin can access /owner routes
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default OwnerRoute;