import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ui/ErrorBoundary';

export default function App() {
  const { bootstrap, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    fetchCart(isAuthenticated);
  }, [isAuthenticated, fetchCart]);

  return (
    <ErrorBoundary>
      {/* Toast Notifications Provider */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#FFF8E7',
            color: '#1F6B3A',
            border: '1px solid #1F6B3A20',
            fontWeight: '600',
            fontFamily: '"Nunito", sans-serif',
            borderRadius: '1rem',
            boxShadow: '0 10px 30px -10px rgba(31, 107, 58, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#1F6B3A',
              secondary: '#FFF8E7',
            },
          },
          error: {
            iconTheme: {
              primary: '#A3260F',
              secondary: '#FFF8E7',
            },
            style: {
              color: '#A3260F',
              border: '1px solid #A3260F20',
            },
          },
        }}
      />

      {/* Main Routed Application */}
      <AppRoutes />
    </ErrorBoundary>
  );
}
