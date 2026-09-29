import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';

// =============================================================
// 🔥 MUST: Load Base Layout Styles (Default Theme)
// =============================================================
import '../themes/default.css';

const ThemeContext = createContext();

// =============================================================
// 🔥 Dynamic Theme CSS Loader using Vite Glob
// =============================================================
const themeModules = import.meta.glob('../themes/theme*.css?inline', { eager: false });

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(1);
  const hasLoaded = useRef(false);
  const styleRef = useRef(null);

  // =============================================================
  // 🔥 Load Theme CSS (find matching key dynamically)
  // =============================================================
  const loadThemeCSS = useCallback(async (themeId) => {
    // Remove previous theme style
    if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }

    // If themeId is 0 (Default), just remove styles and return
    if (themeId === 0) {
      console.log('ℹ️ Default theme selected. No custom theme CSS loaded.');
      return;
    }

    try {
      const keys = Object.keys(themeModules);
      const matchingKey = keys.find(key => key.includes(`theme${themeId}.css`));

      if (!matchingKey) {
        console.warn(`⚠️ No CSS file found for theme ${themeId}. Falling back to default.`);
        if (themeId !== 0) {
          // Remove any existing style and use default
          return;
        }
        return;
      }

      const module = await themeModules[matchingKey]();
      const cssContent = module.default;

      if (cssContent) {
        const style = document.createElement('style');
        style.textContent = cssContent;
        style.setAttribute('data-theme-id', themeId);
        document.head.appendChild(style);
        styleRef.current = style;
        console.log(`✅ Theme ${themeId} CSS loaded successfully.`);
      }
    } catch (err) {
      console.error(`❌ Failed to load theme ${themeId} CSS:`, err);
    }
  }, []);

  // =============================================================
  // 🔥 Load Theme from localStorage (only once)
  // =============================================================
  const loadTheme = useCallback(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    try {
      const stored = localStorage.getItem('selectedTheme');
      const themeId = stored ? parseInt(stored, 10) : 1;

      setCurrentTheme(themeId);
      // Load theme only if not default (0)
      if (themeId !== 0) {
        loadThemeCSS(themeId);
      }
    } catch (err) {
      console.error('Load theme error:', err);
      setCurrentTheme(1);
      loadThemeCSS(1);
    }
  }, [loadThemeCSS]);

  // =============================================================
  // 🔥 Switch Theme (Update localStorage + Load CSS)
  // =============================================================
  const switchTheme = useCallback((themeId) => {
    try {
      localStorage.setItem('selectedTheme', String(themeId));
      setCurrentTheme(themeId);

      // If default (0), remove any injected styles
      if (themeId === 0) {
        if (styleRef.current) {
          styleRef.current.remove();
          styleRef.current = null;
        }
        return;
      }

      loadThemeCSS(themeId);
    } catch (err) {
      console.error('Switch theme error:', err);
    }
  }, [loadThemeCSS]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // =============================================================
  // 🔥 Cleanup on unmount (remove injected style)
  // =============================================================
  useEffect(() => {
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
      }
    };
  }, []);

  const value = {
    currentTheme,
    loadTheme,
    switchTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.warn('⚠️ useTheme called outside ThemeProvider - using fallback');
    return {
      currentTheme: 1,
      loadTheme: () => { },
      switchTheme: () => { },
    };
  }
  return context;
};