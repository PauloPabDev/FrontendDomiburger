// context/OrdersContext.js
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { filtrarPedidos } from '../Utils/filtrarPedidos';
import { usePreferences } from './PreferencesContext';
import { io } from 'socket.io-client';
import { getUrlSocket } from '../Utils/getUrlApiByOriginPath';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotificationSound } from '../hooks/useNotificationSound';
import { useShowNotification } from '../hooks/useShowNotification';
import { useOnlineStatus, CONNECTION_STATUS } from '../hooks/useConnectionStatus';
import { SOCKET_OPTIONS } from '../hooks/useSocket';

export const MiContexto = createContext();

export const ContextProvider = ({ children }) => {
  const apiUrl = getUrlSocket();
  const socketRef = useRef(null);
  const isSocketInitialized = useRef(false);

  const { roleSelect: ROLE } = usePreferences();
  const { usuarioActual, token, userData } = useAuth();

  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [idItemSelect, setIdItemSelect] = useState(null);
  const [zoomMaps, setZoomMaps] = useState(15);
  const [alertaActiva, setAlertaActiva] = useState(false);

  const [kitchenSelectId, setKitchenSelectId] = useLocalStorage('kitchenSelectId', null);
  const { alertSound, errorCriticalSound, successSound } = useNotificationSound();
  const { notify } = useShowNotification();

  // Detectar estado de internet
  const isOnline = useOnlineStatus();

  // Estado de conexión del socket
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.IDLE);
  const hasPlayedConnectSound = useRef(false);

  // Derivar isConnected para compatibilidad
  const isConnected = connectionStatus === CONNECTION_STATUS.CONNECTED;

  // Refs para valores actuales (evitar recrear socket)
  const roleRef = useRef(ROLE);
  const tokenRef = useRef(token);
  const kitchenIdRef = useRef(kitchenSelectId);

  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    roleRef.current = ROLE;
  }, [ROLE]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    kitchenIdRef.current = kitchenSelectId;
  }, [kitchenSelectId]);

  const changeKitchen = (id) => {
    setKitchenSelectId(id);
  };

  const ordenarYNumerarPedidos = useCallback((orders) => {
    const sorted = orders.sort((a, b) => (a.dailyOrderNumber) - (b.dailyOrderNumber));
    return sorted.map((order, index) => ({ ...order, orderNumber: index + 1 }));
  }, []);

  const actualizarPedidos = useCallback((orders) => {
    const pedidosFiltrados = filtrarPedidos(orders, roleRef.current);
    return ordenarYNumerarPedidos(pedidosFiltrados);
  }, [ordenarYNumerarPedidos]);

  // Asignación de cocina al inicio
  useEffect(() => {
    const assignedKitchens = userData?.assignedKitchens || [];
    if (assignedKitchens.length === 0) {
      toast.error('No tiene cocinas asignadas');
      changeKitchen(null);
      return;
    }
    if (assignedKitchens.length === 1) {
      changeKitchen(assignedKitchens[0]);
      return;
    }
    if (kitchenSelectId) {
      const kitchen = assignedKitchens.find(kitchen => kitchen.id === kitchenSelectId);
      if (kitchen) {
        changeKitchen(kitchen);
        return;
      }
    }
  }, [usuarioActual]);

  // Función para emitir login
  const emitLogin = useCallback(() => {
    if (socketRef.current?.connected && roleRef.current) {
      const params = {
        token: tokenRef.current,
        role: roleRef.current,
        kitchenId: kitchenIdRef.current
      };
      socketRef.current.emit('login', params);
    }
  }, []);

  // Reconexión manual mejorada
  const reconnectSocket = useCallback(() => {
    if (!isOnline) {
      toast.warning('Sin conexión a internet');
      return;
    }

    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
      toast.info('Intentando reconectar...');
    }
  }, [isOnline]);

  // Reconectar automáticamente cuando vuelve internet
  useEffect(() => {
    if (!socketRef.current) return;

    if (isOnline && !socketRef.current.connected && isSocketInitialized.current) {
      socketRef.current.connect();
    }
  }, [isOnline]);

  // Actualizar estado cuando cambia la conexión a internet
  useEffect(() => {
    if (!isOnline) {
      setConnectionStatus(CONNECTION_STATUS.OFFLINE);
    }
  }, [isOnline]);

  // Sonidos de conexión/desconexión
  useEffect(() => {
    if (connectionStatus === CONNECTION_STATUS.CONNECTED && !hasPlayedConnectSound.current) {
      successSound();
      hasPlayedConnectSound.current = true;
    } else if (connectionStatus === CONNECTION_STATUS.DISCONNECTED || connectionStatus === CONNECTION_STATUS.OFFLINE) {
      if (hasPlayedConnectSound.current) {
        errorCriticalSound();
      }
      hasPlayedConnectSound.current = false;
    }
  }, [connectionStatus, successSound, errorCriticalSound]);

  // Re-emitir login cuando cambian ROLE o kitchenSelectId (sin recrear socket)
  useEffect(() => {
    if (isSocketInitialized.current && socketRef.current?.connected) {
      emitLogin();
    }
  }, [ROLE, kitchenSelectId, emitLogin]);

  // Inicialización del socket (solo una vez)
  useEffect(() => {
    // Evitar inicialización duplicada
    if (isSocketInitialized.current) return;

    socketRef.current = io(`${apiUrl}/apiV2`, SOCKET_OPTIONS);
    isSocketInitialized.current = true;

    setConnectionStatus(CONNECTION_STATUS.CONNECTING);

    // Conexión exitosa
    socketRef.current.on("connect", () => {
      setConnectionStatus(CONNECTION_STATUS.CONNECTED);
      emitLogin();
    });

    // Desconexión
    socketRef.current.on('disconnect', (reason) => {
      if (reason === 'io client disconnect') {
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      } else {
        setConnectionStatus(CONNECTION_STATUS.RECONNECTING);
      }
    });

    // Error de conexión
    socketRef.current.on('connect_error', () => {
      setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
    });

    // Intentos de reconexión
    if (socketRef.current.io) {
      socketRef.current.io.on('reconnect_attempt', () => {
        setConnectionStatus(CONNECTION_STATUS.RECONNECTING);
      });

      socketRef.current.io.on('reconnect', () => {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
      });
    }

    // Manejo de mensajes
    socketRef.current.on("message", (newMessage) => {
      const { type, message } = newMessage;
      if (type === 'alert') {
        alertSound();
        notify('Nuevo mensaje', { body: message });
      }
      toast(message);
    });

    // Pedidos iniciales
    socketRef.current.on('order/init', (orders) => {
      const processedOrders = actualizarPedidos(orders);
      setItems(processedOrders);
    });

    // Cuando se crea un pedido
    socketRef.current.on('order/create', (pedido) => {
      toast(`Pedido creado 🚚, ${pedido.id}`);
      alertSound();
      setItems((prevItems) => {
        const mapItems = new Map(prevItems.map((item) => [item.id, item]));
        mapItems.set(pedido.id, pedido);
        return actualizarPedidos(Array.from(mapItems.values()));
      });
    });

    // Cuando se actualiza un pedido
    socketRef.current.on('order/update', (pedido) => {
      setItems((prevItems) => {
        const mapItems = new Map(prevItems.map((item) => [item.id, item]));
        mapItems.set(pedido.id, pedido);
        return actualizarPedidos(Array.from(mapItems.values()));
      });
    });

    // Cuando se remueve un pedido
    socketRef.current.on('order/remove', (pedido) => {
      toast(`Pedido removido 🚚, ${pedido.id}`);
      setItems((prevItems) => {
        const mapItems = new Map(prevItems.map((item) => [item.id, item]));
        mapItems.delete(pedido.id);
        return actualizarPedidos(Array.from(mapItems.values()));
      });
    });

    // Cuando se elimina un pedido
    socketRef.current.on('order/delete', (pedido) => {
      toast(`Pedido eliminado 🚚, ${pedido.id}`);
      setItems((prevItems) => {
        const mapItems = new Map(prevItems.map((item) => [item.id, item]));
        mapItems.delete(pedido.id);
        return actualizarPedidos(Array.from(mapItems.values()));
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        if (socketRef.current.io) {
          socketRef.current.io.removeAllListeners();
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      isSocketInitialized.current = false;
    };
  }, [apiUrl]); // Solo depende de apiUrl

  return (
    <MiContexto.Provider
      value={{
        items,
        setItems,
        alerts,
        setAlerts,
        idItemSelect,
        setIdItemSelect,
        zoomMaps,
        setZoomMaps,
        alertaActiva,
        setAlertaActiva,
        // Estados de conexión
        connectionStatus,
        isConnected,
        isOnline,
        reconnectSocket,
        kitchenSelectId,
        changeKitchen
      }}
    >
      {children}
    </MiContexto.Provider>
  );
};

export const useMiContexto = () => useContext(MiContexto);
