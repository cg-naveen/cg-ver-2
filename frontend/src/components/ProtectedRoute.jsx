import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles}) {
  const { user, loading } = useAuth();
  //checking auth state
  if (loading) return <div>Loading...</div>;

  //not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
}

  //logged in but wrong route
  if(allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to='/' replace />;
  }

  //allowed
  return <Outlet />;
}