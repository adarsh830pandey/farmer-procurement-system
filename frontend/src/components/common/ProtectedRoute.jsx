import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSkeleton';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Verifying government authorization credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // If attempting to visit admin route, redirect to admin login, otherwise farmer login
    const isTargetingAdmin = location.pathname.startsWith('/admin');
    return (
      <Navigate
        to={isTargetingAdmin ? '/admin/login' : '/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requiredRole && role !== requiredRole) {
    // If logged in as farmer but trying to access admin
    if (role === 'farmer' && requiredRole === 'admin') {
      return <Navigate to="/farmer/dashboard" replace />;
    }
    // If logged in as admin but trying to access farmer
    if (role === 'admin' && requiredRole === 'farmer') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
