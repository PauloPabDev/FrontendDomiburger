import { createContext, useState, useEffect, useContext, useRef, useMemo } from 'react';
import { FirebaseAuth } from '../firebase/config';
import { onAuthStateChanged, getIdToken, signOut } from 'firebase/auth';
import { LOGIN_ROUTES } from '../Utils/const/namesRutes';
import { useNavigate } from 'react-router-dom';
import { UsersService } from '../apis/clientV2/usersService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const refreshTimeout = useRef(null);

  // Función para obtener el ID Token manualmente
  const refreshToken = async () => {
    if (usuarioActual) {
      try {
        const newToken = await getIdToken(usuarioActual, true);
        setToken(newToken);
      } catch (_error) {
      }
    }
  };

  // Función para programar la actualización del token antes de que expire
  const scheduleTokenRefresh = (token) => {
    if (!token) return;
    try {
      // Decodificamos el payload del token (JWT tiene el formato header.payload.signature)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
      // La propiedad exp viene en segundos, la convertimos a milisegundos
      const exp = payload.exp * 1000;
      const now = Date.now();
      // Programamos la actualización un minuto antes de la expiración
      const delay = exp - now - 60000;
      if (delay > 0) {
        if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
        refreshTimeout.current = setTimeout(() => {
          refreshToken();
        }, delay);
      }
    } catch (_error) {
    }
  };

  useEffect(() => {
    // Escuchar cambios en la autenticación
    const unsubscribe = onAuthStateChanged(FirebaseAuth, async (user) => {
      // Agregar roles personalizados al usuario
      const customAttributes = user?.reloadUserInfo?.customAttributes || '{}';
      const roles = JSON.parse(customAttributes)?.roles || [];
      if (user) user.roles = roles || [];

      setUsuarioActual(user);
      if (user) {
        const fetchedToken = await getIdToken(user);
        setToken(fetchedToken);
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Efecto que reprograma la actualización del token cada vez que éste cambia
  useEffect(() => {
    if (token) {
      scheduleTokenRefresh(token);
    } else {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    }
  }, [token]);

  // Obtención de datos adicionales del usuario
  const usersService = useMemo(() => new UsersService(token), [token]);
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      try {
        const response = await usersService.me();
        setUserData(response);
      } catch (_error) {
      }
    };
    fetchUserData();
  }, [token, usersService]);

  const isValidToken = async () => {
    return onAuthStateChanged(FirebaseAuth, async (user) => {
      if (user) {
        const fetchedToken = await getIdToken(user);
        setToken(fetchedToken);
      } else {
        setToken(null);
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(FirebaseAuth);
      navigate(LOGIN_ROUTES.routes.LOGIN_AUTH);
    } catch (_error) {
    }
  };

  return (
    <AuthContext.Provider value={{
      usuarioActual,
      token,
      refreshToken,
      handleLogout,
      userData,
      isValidToken
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto en otros componentes
export const useAuth = () => useContext(AuthContext);
