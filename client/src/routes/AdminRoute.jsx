import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (!isAdmin) {
    toast.error('Access restricted. Admin authorization required.');
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
