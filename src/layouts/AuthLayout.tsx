import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthLayout.scss';

const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (!loading && user) {
    if (user.role === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />;
    } else if (user.role === 'employer') {
      return <Navigate to="/employer/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
