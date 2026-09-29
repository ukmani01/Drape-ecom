import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import * as authApi from '../api/auth';
import { getSubscriptionStatus } from '../api/subscriptions'; // 🔥 NEW
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [features, setFeatures] = useState({}); // 🔥 NEW
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await authApi.getMe();
          const userData = data.data.user;
          setUser(userData);

          // 🔥 NEW: Fetch subscription features after login
          if (userData?.storeId) {
            try {
              const subRes = await getSubscriptionStatus();
              const subData = subRes.data.data;
              setFeatures(subData?.plan?.features || {});
            } catch (subErr) {
              console.warn('Failed to fetch subscription features:', subErr);
              setFeatures({});
            }
          }
        } catch (err) {
          if (err.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          } else {
            console.warn('⚠️ Infrastructure or network error during initAuth, keeping session tokens:', err.message);
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('accessToken', data.data.token);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);

    // 🔥 NEW: Fetch features after login
    try {
      const subRes = await getSubscriptionStatus();
      const subData = subRes.data.data;
      setFeatures(subData?.plan?.features || {});
    } catch (subErr) {
      console.warn('Failed to fetch subscription features:', subErr);
      setFeatures({});
    }

    toast.success('Login successful!');
    return data.data;
  };

  const register = async (userData) => {
    const { data } = await authApi.register(userData);
    localStorage.setItem('accessToken', data.data.token);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);

    // 🔥 NEW: Fetch features after registration
    try {
      const subRes = await getSubscriptionStatus();
      const subData = subRes.data.data;
      setFeatures(subData?.plan?.features || {});
    } catch (subErr) {
      console.warn('Failed to fetch subscription features:', subErr);
      setFeatures({});
    }

    toast.success('Registration successful!');
    return data.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) { }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setFeatures({}); // 🔥 NEW: Clear features on logout
    toast.success('Logged out');
  };

  const updateUser = (userData) => setUser(userData);

  // ✅ NEW: Helper functions for role checks
  const isSuperAdmin = () => user?.role === 'super_admin';
  const isStoreOwner = () => user?.role === 'owner';
  const isAdmin = () => user?.role === 'admin' || user?.role === 'owner' || user?.role === 'super_admin';
  const isStaff = () => user?.role === 'staff' || user?.role === 'admin' || user?.role === 'owner' || user?.role === 'super_admin';

  // 🔥 NEW: Feature access hook
  const useFeature = (featureKey) => {
    return features?.[featureKey] === true;
  };

  // 🔥 NEW: Numeric limit check (returns the limit or -1 for unlimited)
  const getFeatureLimit = (limitKey) => {
    return features?.[limitKey] ?? 0;
  };

  const value = {
    user,
    features, // 🔥 NEW
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isSuperAdmin,
    isStoreOwner,
    isAdmin,
    isStaff,
    useFeature,    // 🔥 NEW
    getFeatureLimit, // 🔥 NEW
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);