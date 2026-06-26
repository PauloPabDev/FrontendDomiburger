import { Container, } from "react-bootstrap";
import PaginationComponent from "../Pagination";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// import orderservice from "../../apis/client/Orderservice";
import { toast } from "react-toastify";
import orderService from "../../apis/client/OrderService";
import ListOrders from "./ListOrders";
import { useAuth } from "../../Context/AuthContext";


const VisualizarPedidosComponente = () => {

  const { token } = useAuth()

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);


  const navigate = useNavigate();



  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const limit = 12

        const data = await orderService.getAll({ page, limit }, token);
        setOrders(data?.body);
      } catch (error) {
        setError('Error fetching orders');
        toast.error('Error al cargar los pedidos');
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  const handleCardCreateOrderClick = () => {
    navigate('/formAdmin');
  }

  return (
    <Container >

      <ListOrders
        orders={orders}
        loading={loading}
        error={error}
        handleCardClick={handleCardCreateOrderClick}
      />

      <PaginationComponent
        page={page}
        handlePageChange={(newPage) => setSearchParams({ page: newPage })}
      />

    </Container>
  );
}

export { VisualizarPedidosComponente };