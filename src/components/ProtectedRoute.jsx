import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-eco-200 border-t-eco-600 animate-spin"></div>
          <Leaf className="w-6 h-6 text-eco-600 absolute" />
        </div>
        <p className="text-slate-600 font-medium text-sm animate-pulse">
          Authenticating Eco Club session...
        </p>
      </div>
    );
  }

  // Not logged in -> send to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role restrictions
  if (allowedRole) {
    if (allowedRole === 'ADMIN' && role !== 'ADMIN') {
      // Student trying to access admin page: Deny access -> redirect to student dashboard
      return <Navigate to="/student" replace />;
    }
    if (allowedRole === 'STUDENT' && role !== 'STUDENT') {
      // Admin trying to access student dashboard: redirect to admin dashboard
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}
