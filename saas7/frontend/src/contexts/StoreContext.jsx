import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as settingsApi from '../api/settings';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.storeId) {
      fetchSettings();
    } else {
      setStore(null);
      setSettings(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsApi.getSettings();
      setSettings(data.data);
      setStore({ id: user.storeId, name: data.data?.brand?.name || 'My Store' });
    } catch (err) {
      console.error('Failed to fetch store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    const { data } = await settingsApi.updateSettings(newSettings);
    setSettings(data.data);
    return data.data;
  };

  const value = {
    store,
    settings,
    loading,
    fetchSettings,
    updateSettings,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
