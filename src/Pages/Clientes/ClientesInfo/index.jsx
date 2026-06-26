import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaHistory, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import LayoutRecepcion from '../../../Layout/Recepcion';
import { ContextProviderRecepcion } from '../../../Context/RecepcionContex';
import { useAuth } from '../../../Context/AuthContext';
import { ClientsService } from '../../../apis/clientV2/ClientsService';
import { OrderService } from '../../../apis/clientV2/OrderService';
import {
  ClientInfoCard,
  ClientOrdersHistory,
  ClientLocations,
  ClientStats
} from '../../../components/Client/ClientDetails';
import { EditClient } from '../../../components/Client/EditCllient';
import { RECEPCION_ROUTES } from '../../../Utils/const/namesRutes';

const ClienteInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const fetchClientData = async () => {
    if (!id || !token) return;
    setLoading(true);
    setError(null);

    try {
      const clientsService = new ClientsService(token);
      const clientResponse = await clientsService.getById(id);
      setClient(clientResponse?.body || clientResponse);

      try {
        const orderService = new OrderService(token);
        const ordersResponse = await orderService.getByClientId(id);
        setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      } catch (orderErr) {
        setOrders([]);
      }
    } catch (err) {
      setError('Error al cargar los datos del cliente');
      toast.error('Error al cargar los datos del cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id, token]);

  const handleBack = () => {
    navigate(RECEPCION_ROUTES.routes.CLIENTES);
  };

  const handleEditToggle = () => {
    setShowEdit(!showEdit);
  };

  if (loading) {
    return (
      <LayoutRecepcion>
        <Container fluid className="py-4">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando datos del cliente...</p>
          </div>
        </Container>
      </LayoutRecepcion>
    );
  }

  if (error || !client) {
    return (
      <LayoutRecepcion>
        <Container fluid className="py-4">
          <Alert variant="danger" className="text-center">
            <h4>Cliente no encontrado</h4>
            <p>{error || 'No se pudo cargar la informacion del cliente.'}</p>
            <Button variant="primary" onClick={handleBack}>
              <FaArrowLeft className="me-2" /> Volver a Clientes
            </Button>
          </Alert>
        </Container>
      </LayoutRecepcion>
    );
  }

  return (
    <LayoutRecepcion>
      <ContextProviderRecepcion>
        <Container fluid className="py-4 px-4">
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                  <Button variant="outline-secondary" onClick={handleBack}>
                    <FaArrowLeft />
                  </Button>
                  <h2 className="mb-0 text-primary">
                    <FaUser className="me-2" />
                    Detalles del Cliente
                  </h2>
                </div>
              </div>
            </Col>
          </Row>

          <ClientStats orders={orders} />

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab
              eventKey="info"
              title={
                <span>
                  <FaUser className="me-1" /> Informacion
                </span>
              }
            >
              <Row className="mt-3">
                <Col lg={6} className="mb-4">
                  {showEdit ? (
                    <EditClient
                      client={client}
                      setClient={setClient}
                      onCancel={() => setShowEdit(false)}
                    />
                  ) : (
                    <ClientInfoCard client={client} onEdit={handleEditToggle} />
                  )}
                </Col>
                <Col lg={6} className="mb-4">
                  <ClientLocations clientId={id} />
                </Col>
              </Row>
            </Tab>

            <Tab
              eventKey="orders"
              title={
                <span>
                  <FaHistory className="me-1" /> Historial de Pedidos ({orders.length})
                </span>
              }
            >
              <Row className="mt-3">
                <Col>
                  <ClientOrdersHistory clientId={id} />
                </Col>
              </Row>
            </Tab>

            <Tab
              eventKey="locations"
              title={
                <span>
                  <FaMapMarkerAlt className="me-1" /> Direcciones
                </span>
              }
            >
              <Row className="mt-3">
                <Col lg={8} className="mx-auto">
                  <ClientLocations clientId={id} />
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Container>
      </ContextProviderRecepcion>
    </LayoutRecepcion>
  );
};

export default ClienteInfo;
