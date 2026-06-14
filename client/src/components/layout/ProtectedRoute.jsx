import { Navigate, Outlet } from 'react-router-dom';
import { useAuth }          from '../../hooks/useAuth.js';

// allowedRoles = [] means any authenticated user
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuth, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;