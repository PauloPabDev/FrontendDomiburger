import { Alert, Button, Container, Spinner } from "react-bootstrap";
import LayoutRecepcion from "../../../Layout/Recepcion";
import { useOrderHistory } from "./hooks/useOrderHistory.jsx";
import { useEffect } from "react";
import { OrdersRowsContainer } from "../../../components/Order/OrdersRowsContainer.jsx";

const HistoryOrders = () => {

  // Pedir las órdenes del día con fechas formateadas en UTCz
  const { error, data: ordenes, loading, fetchOrders } = useOrderHistory();
  const fetchData = async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    await fetchOrders(start.toGMTString(), end.toGMTString());
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <LayoutRecepcion>
      <Container fluid>
        <h1 className="text-center my-3">Historial</h1>
        <p>Los pedidos que he creado hoy</p>

        {/* form filter order */}

        {/* Mostrar si hay un error */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Mostrar si está cargando */}
        {loading && <div className="text-center"><Spinner animation="border" /></div>}

        <OrdersRowsContainer listOrders={ordenes} />

        {/* boton para reintertar */}
        <Button variant="primary" onClick={fetchData}>Reintentar</Button>

      </Container>
    </LayoutRecepcion >
  );
};

export { HistoryOrders };
