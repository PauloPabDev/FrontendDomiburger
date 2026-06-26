import { useState, useMemo, useCallback } from "react";
import { OrderService } from "../../../../apis/clientV2/OrderService";
import { useAuth } from "../../../../Context/AuthContext";

const useOrderHistory = () => {
  const { token, usuarioActual } = useAuth();

  const orderService = useMemo(() => new OrderService(token), [token]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [ordenes, setOrdenes] = useState([]);

  const fetchOrders = useCallback(async (startDate, endDate) => {
    const userCreateId = usuarioActual?.uid;

    setLoading(true);
    try {
      const response = await orderService.getOrdersByUserCreate({ userCreateId, startDate, endDate });
      setOrdenes(response);
    } catch (error) {
      setError(error?.message || 'Error al cargar historial');
    }
    setLoading(false);
  }, [orderService, usuarioActual?.uid]);

  return {
    error,
    data: ordenes,
    loading,
    fetchOrders
  };
}

export { useOrderHistory }