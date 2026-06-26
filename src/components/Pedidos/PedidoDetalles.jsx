import { Container, } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { OrderService } from "../../apis/clientV2/OrderService";
import { OrderCardV2 } from "../OrderCardV2";


const PedidoDetalles = () => {

  const { token } = useAuth()

  //sacar el id del pedido de la url
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderService = useMemo(() => new OrderService(token), [token]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getById(id);
        toast.success('Pedido cargado');
        setOrder(data);
      } catch (error) {
        setError('Error fetching orders');
        toast.error('Error al cargar los pedidos');
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);


  return (
    <Container >

      <h1>Detalles del pedido</h1>
      {loading && <p>Cargando...</p>}
      {error && <p>{error}</p>}
      {order && (
        <OrderCardV2 data={order} />

      )}

    </Container>
  );
}

export { PedidoDetalles };