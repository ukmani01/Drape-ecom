import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { CartProvider } from './contexts/CartContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import { ErrorFallback } from './components/ui/ErrorFallback';

// ✅ Permanent Fix: Global staleTime prevents ALL infinite refetch loops
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      staleTime: 5 * 60 * 1000, // ✅ 5 minutes – NO refetch during this time
      gcTime: 24 * 60 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StoreProvider>
              <ThemeProvider>
                <CartProvider>
                  <RecentlyViewedProvider>
                    <Toaster
                      position="top-center"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: '#1a1a1a',
                          color: '#fff',
                          borderRadius: '12px',
                          padding: '16px',
                        },
                        success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                      }}
                    />
                    <App />
                  </RecentlyViewedProvider>
                </CartProvider>
              </ThemeProvider>
            </StoreProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);