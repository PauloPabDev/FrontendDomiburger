import { useState, useEffect } from 'react';
import { Table, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { FaShoppingCart, FaEye, FaRedo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { OrderService } from '../../../apis/clientV2/OrderService';
import { useAuth } from '../../../Context/AuthContext';
import { RECEPCION_ROUTES } from '../../../Utils/const/namesRutes';

const estadoColors = {
  'Pendiente': 'warning',
  'Calientes': 'danger',
  'Preparando': 'info',
  'Despachados': 'primary',
  'Entregados': 'success',
  'Facturados': 'secondary',
  'Eliminados': 'dark',
  'PendieteTransferencia': 'warning'
};

const ClientOrdersHistory = ({ clientId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const orderService = new OrderService(token);
      const data = await orderService.getByClientId(clientId);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar el historial de pedidos');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [clientId, token]);

  const formatDate = (dateObj) => {
    if (!dateObj) return '-';
    let date;
    if (dateObj._seconds) {
      date = new Date(dateObj._seconds * 1000);
    } else if (typeof dateObj === 'string') {
      date = new Date(dateObj);
    } else {
      return '-';
    }
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const handleViewOrder = (orderId) => {
    navigate(`${RECEPCION_ROUTES.routes.PEDIDOS}/${orderId}`);
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white">
          <FaShoppingCart className="me-2" />
          Historial de Pedidos
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="info" />
          <p className="mt-2 text-muted">Cargando pedidos...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white">
          <FaShoppingCart className="me-2" />
          Historial de Pedidos
        </Card.Header>
        <Card.Body>
          <Alert variant="danger" className="mb-0">
            {error}
            <Button variant="link" size="sm" onClick={fetchOrders}>
              <FaRedo className="me-1" /> Reintentar
            </Button>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
        <span>
          <FaShoppingCart className="me-2" />
          Historial de Pedidos ({orders.length})
        </span>
        <Button variant="light" size="sm" onClick={fetchOrders}>
          <FaRedo />
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        {orders.length === 0 ? (
          <Alert variant="info" className="m-3 mb-0">
            Este cliente no tiene pedidos registrados.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Metodo Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.id || index}>
                    <td className="align-middle">
                      <small className="text-muted">{order.numeroPedido || index + 1}</small>
                    </td>
                    <td className="align-middle">
                      <small>{formatDate(order.date || order.dateCreate)}</small>
                    </td>
                    <td className="align-middle">
                      <Badge bg={estadoColors[order.estado] || 'secondary'}>
                        {order.estado || 'Desconocido'}
                      </Badge>
                    </td>
                    <td className="align-middle fw-bold">
                      {formatCurrency(order.total || order.totalPedido)}
                    </td>
                    <td className="align-middle">
                      <small>{order.paymentMethod || order.metodoPago || '-'}</small>
                    </td>
                    <td className="align-middle">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
                        title="Ver pedido"
                      >
                        <FaEye />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export { ClientOrdersHistory };
