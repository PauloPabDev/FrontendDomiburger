import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../Context/AuthContext';
import { LOGIN_ROUTES } from '../Utils/const/namesRutes';

const ProtectedRouteFirebase = ({ children }) => {
  const { usuarioActual } = useAuth();

  if (!usuarioActual) {
    return <Navigate to={LOGIN_ROUTES.routes.LOGIN_AUTH} />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRouteFirebase;