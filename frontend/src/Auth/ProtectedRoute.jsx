import { useAuth } from './AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;