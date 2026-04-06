import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!userStr || !token) {
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // If the allowed roles don't include the exact user role, redirect them to their rightful home
    if (!allowedRoles.includes(user.role)) {
      if (user.role === 'FARMER') {
        return <Navigate to="/farmer/dashboard" replace />;
      } else if (user.role === 'BUYER' || user.role === 'WAREHOUSE') {
        // Warehouse isn't fully separate yet, but buyers go to market browse
        return <Navigate to="/market/browse" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }

    return <>{children}</>;
  } catch (err) {
    // If local storage is corrupted
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to="/auth" replace />;
  }
}
