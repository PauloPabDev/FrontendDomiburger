import { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { UsersService } from '../apis/clientV2/usersService';
import { ClientsService } from '../apis/clientV2/ClientsService';
import { LocationsService } from '../apis/clientV2/LocationsService';
import { usersCache, clientsCache, locationsCache } from '../Utils/cache/SimpleCache';

const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const { token } = useAuth();

  // Servicios memoizados - se recrean solo cuando cambia el token
  const usersService = useMemo(() => new UsersService(token), [token]);
  const clientsService = useMemo(() => new ClientsService(token), [token]);
  const locationsService = useMemo(() => new LocationsService(token), [token]);

  // Obtener usuario por ID con cache
  const getUserById = useCallback(async (id) => {
    if (!id) return null;

    const cached = usersCache.get(id);
    if (cached) return cached;

    try {
      const response = await usersService.getByIdUser(id);
      const user = response?.body || response;
      usersCache.set(id, user);
      return user;
    } catch (error) {
      return null;
    }
  }, [usersService]);

  // Obtener cliente por ID con cache
  const getClientById = useCallback(async (id) => {
    if (!id) return null;

    const cached = clientsCache.get(id);
    if (cached) return cached;

    try {
      const response = await clientsService.getById(id);
      const client = response?.body || response;
      clientsCache.set(id, client);
      return client;
    } catch (error) {
      return null;
    }
  }, [clientsService]);

  // Obtener ubicacion por ID con cache
  const getLocationById = useCallback(async (id) => {
    if (!id) return null;

    const cached = locationsCache.get(id);
    if (cached) return cached;

    try {
      const response = await locationsService.getById(id);
      const location = response?.body || response;
      locationsCache.set(id, location);
      return location;
    } catch (error) {
      return null;
    }
  }, [locationsService]);

  // Batch fetch para ubicaciones - optimizado para ListMarker
  const getLocationsByIds = useCallback(async (ids) => {
    if (!ids || ids.length === 0) return [];

    const uniqueIds = [...new Set(ids.filter(Boolean))];
    const results = {};
    const uncachedIds = [];

    // Primero revisar cache
    for (const id of uniqueIds) {
      const cached = locationsCache.get(id);
      if (cached) {
        results[id] = cached;
      } else {
        uncachedIds.push(id);
      }
    }

    // Fetch solo los que no estan en cache
    if (uncachedIds.length > 0) {
      const promises = uncachedIds.map(async (id) => {
        try {
          const response = await locationsService.getById(id);
          const location = response?.body || response;
          locationsCache.set(id, location);
          return { id, location };
        } catch (error) {
          return { id, location: null };
        }
      });

      const fetched = await Promise.all(promises);
      for (const { id, location } of fetched) {
        results[id] = location;
      }
    }

    // Retornar en el orden original
    return ids.map(id => results[id] || null);
  }, [locationsService]);

  // Funciones para limpiar cache
  const clearUserCache = useCallback(() => usersCache.clear(), []);
  const clearClientCache = useCallback(() => clientsCache.clear(), []);
  const clearLocationCache = useCallback(() => locationsCache.clear(), []);
  const clearAllCache = useCallback(() => {
    usersCache.clear();
    clientsCache.clear();
    locationsCache.clear();
  }, []);

  const value = useMemo(() => ({
    // Funciones de fetch con cache
    getUserById,
    getClientById,
    getLocationById,
    getLocationsByIds,
    // Funciones para limpiar cache
    clearUserCache,
    clearClientCache,
    clearLocationCache,
    clearAllCache,
  }), [
    getUserById,
    getClientById,
    getLocationById,
    getLocationsByIds,
    clearUserCache,
    clearClientCache,
    clearLocationCache,
    clearAllCache
  ]);

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};
