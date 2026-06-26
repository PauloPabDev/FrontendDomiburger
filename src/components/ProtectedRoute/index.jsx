import { Navigate, Outlet } from 'react-router-dom';
import { LOGIN_ROUTES } from '../../Utils/const/namesRutes';
import { useAuth } from '../../Context/AuthContext';

const ProtectedRoute = ({ roles, children, redirectTo = LOGIN_ROUTES.routes.LOGIN_AUTH }) => {
  const { usuarioActual, isValidToken } = useAuth()

  isValidToken()
  // Si no se especifican usuarios permitidos, permite el acceso
  if (!roles || roles.length === 0) {
    return children ? children : <Outlet />;
  }


  const userRoles = usuarioActual?.roles || []; // Asegúrate de que sea un array

  // Verifica si el rol del usuario actual está en la lista de usuarios permitidos
  if (!userRoles.some(role => roles.includes(role))) {
    return <Navigate to={redirectTo} />;
  }

  // contenido protegido
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
