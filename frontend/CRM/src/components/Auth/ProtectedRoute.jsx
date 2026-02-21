import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

/**
 * Wraps a route and redirects to "/" if user is not logged in.
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
