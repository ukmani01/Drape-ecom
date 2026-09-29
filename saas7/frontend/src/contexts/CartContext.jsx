import React, { createContext, useState, useContext, useEffect } from 'react';
import * as cartApi from '../api/cart';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext'; // ✅ AuthContext-ஐ Import பண்ணவும்

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth(); // ✅ Auth loading & user

  // ✅ fetchCart – User Authenticated-ஆக இருந்தால் மட்டுமே Call பண்ணு
  const fetchCart = async () => {
    // Guest User-க்கு Cart-ஐ API-லிருந்து Fetch பண்ண வேண்டாம்
    if (!user) {
      setCart({ items: [], total: 0 });
      return;
    }
    setLoading(true);
    try {
      const { data } = await cartApi.getCart();
      setCart(data.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      // 401 வந்தால், Token Refresh செய்ய Interceptor-ல் Handle பண்ணும்
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auth Loading முடிந்து, User Authenticated ஆன பின்னரே fetch பண்ணு
  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [authLoading, user]); // user மாறும்போதும் (Login/Logout) fetch பண்ணும்

  // ... மற்ற functions (addToCart, updateItem, removeItem, clearCart, mergeGuestCart) 
  // அப்படியே இருக்கும், ஆனால் அவை Call ஆகும் முன் user-ஐ Check பண்ணலாம் (விரும்பினால்).

  const addToCart = async (productId, variant, quantity) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      throw new Error('Not authenticated');
    }
    try {
      const { data } = await cartApi.addToCart({ productId, variant, quantity });
      setCart(data.data);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      throw err;
    }
  };

  const updateItem = async (productId, quantity) => {
    if (!user) return;
    try {
      const { data } = await cartApi.updateCartItem({ productId, quantity });
      setCart(data.data);
    } catch (err) {
      toast.error('Failed to update cart');
      throw err;
    }
  };

  const removeItem = async (productId) => {
    if (!user) return;
    try {
      const { data } = await cartApi.removeFromCart(productId);
      setCart(data.data);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCart({ items: [], total: 0 });
      return;
    }
    try {
      const { data } = await cartApi.clearCart();
      setCart(data.data);
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  const mergeGuestCart = async (guestItems) => {
    if (!user) return;
    try {
      const { data } = await cartApi.mergeGuestCart(guestItems);
      setCart(data.data);
    } catch (err) {
      console.error('Failed to merge cart:', err);
    }
  };

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    mergeGuestCart,
    totalItems: cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
    subtotal: cart.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);