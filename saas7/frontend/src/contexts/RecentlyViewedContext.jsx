import React, { createContext, useState, useEffect, useContext } from 'react';
import * as recentlyViewedApi from '../api/recentlyViewed';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const RecentlyViewedContext = createContext();

export const RecentlyViewedProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (isAuthenticated) {
        try {
          const response = await recentlyViewedApi.getRecentlyViewed();
          // ✅ Safe: ensure we get an array
          const viewedItems = response?.data?.data || [];
          setItems(Array.isArray(viewedItems) ? viewedItems : []);
        } catch (err) {
          console.error('Failed to fetch recently viewed:', err);
          setItems([]);
        } finally {
          setLoading(false);
        }
      } else {
        // Guest user: load from localStorage
        try {
          const stored = localStorage.getItem('recentlyViewed');
          if (stored) {
            const parsed = JSON.parse(stored);
            setItems(Array.isArray(parsed) ? parsed : []);
          } else {
            setItems([]);
          }
        } catch {
          setItems([]);
        }
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const addItem = async (product) => {
    if (!product || !product._id) return;

    if (isAuthenticated) {
      try {
        await recentlyViewedApi.addRecentlyViewed(product._id);
        // Re-fetch to sync with server
        const response = await recentlyViewedApi.getRecentlyViewed();
        const viewedItems = response?.data?.data || [];
        setItems(Array.isArray(viewedItems) ? viewedItems : []);
      } catch (err) {
        console.error('Failed to add recently viewed:', err);
      }
    } else {
      // Guest: store locally
      const newItems = [product, ...items.filter(item => item._id !== product._id)].slice(0, 20);
      setItems(newItems);
      try {
        localStorage.setItem('recentlyViewed', JSON.stringify(newItems));
      } catch (err) {
        // ignore
      }
    }
  };

  const clearAll = async () => {
    if (isAuthenticated) {
      try {
        await recentlyViewedApi.clearRecentlyViewed();
        setItems([]);
      } catch (err) {
        console.error('Failed to clear recently viewed:', err);
        // Still clear locally
        setItems([]);
      }
    } else {
      setItems([]);
      try {
        localStorage.removeItem('recentlyViewed');
      } catch {
        // ignore
      }
    }
    toast.success('Recently viewed cleared');
  };

  const value = {
    items,
    loading,
    addItem,
    clearAll,
  };

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  // ✅ Safety net: if used outside provider, return default object
  if (!context) {
    console.warn('⚠️ useRecentlyViewed called outside RecentlyViewedProvider – using fallback');
    return {
      items: [],
      loading: false,
      addItem: () => { },
      clearAll: () => { },
    };
  }
  return context;
};