import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ requireAdmin?: boolean }> = ({ requireAdmin = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6F1]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C8D7CB] border-t-[#5B8266] rounded-full animate-spin" />
          <p className="text-xs text-[#6D736E]">Opening Zen Study Notebook...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/notebook" replace />;
  }

  return <Outlet />;
};

export const GuestRoute: React.FC = () => {
  return <Outlet />;
};
