import { Alert, Container, Spinner, Row, Col, Card, ProgressBar } from "react-bootstrap";
import { useEffect } from "react";
import { CourierOrderHistoryCard } from "../../components/Order/CourierOrderHistoryCard.jsx";
import { useOrderFindHistoryByCourier } from "../../hooks/api/order/useOrderFindHistoryByCourier.jsx";
import { useAuth } from "../../Context/AuthContext.jsx";
import { CourierLayout } from "../../Layout/CourierLayout.jsx";
import { useCalculateDataDelivery } from "./useCalculateDataDelivery.jsx";
import { FaMotorcycle, FaMoneyBillWave, FaRoute, FaCalendarDay } from "react-icons/fa";

const CourierHistory = () => {
  const { error, data: ordenes, loading, fetchOrders } = useOrderFindHistoryByCourier();
  const { userData } = useAuth();

  const { priceDeliveryTotal, distanceTotal, countDelivery } = useCalculateDataDelivery(ordenes);

  const metaDiaria = 80000;
  const porcentajeMeta = Math.min((priceDeliveryTotal * 100) / metaDiaria, 100);

  const fetchData = async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const startDate = start.toGMTString();
    const endDate = end.toGMTString();

    await fetchOrders({ startDate, endDate, id: userData.id });
  };

  useEffect(() => {
    if (!userData?.id) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <CourierLayout>
      <Container fluid className="py-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center bg-primary bg-opacity-10 rounded-pill px-3 py-2 mb-3">
            <FaCalendarDay className="text-primary me-2" />
            <span className="text-primary fw-medium text-capitalize">{today}</span>
          </div>
          <h2 className="fw-bold mb-1">Mi Historial</h2>
          <p className="text-muted mb-0">Resumen de tus entregas del día</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="rounded-3 mb-4">
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Cargando tu historial...</p>
          </div>
        ) : (
          <>
            {/* Tarjeta de Progreso Principal */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
              <div className="bg-success bg-gradient p-4 text-white text-center">
                <FaMoneyBillWave size={32} className="mb-2 opacity-75" />
                <h3 className="display-6 fw-bold mb-0">{formatCurrency(priceDeliveryTotal)}</h3>
                <small className="opacity-75">Ganancias del día</small>
              </div>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Progreso hacia la meta</span>
                  <span className="fw-semibold">{porcentajeMeta.toFixed(0)}%</span>
                </div>
                <ProgressBar
                  now={porcentajeMeta}
                  variant={porcentajeMeta >= 100 ? "success" : porcentajeMeta >= 50 ? "primary" : "warning"}
                  className="rounded-pill"
                  style={{ height: "12px" }}
                />
                <div className="d-flex justify-content-between mt-2">
                  <small className="text-muted">$0</small>
                  <small className="text-muted">Meta: {formatCurrency(metaDiaria)}</small>
                </div>
              </Card.Body>
            </Card>

            {/* Estadísticas */}
            <Row className="g-3 mb-4">
              <Col xs={6}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-3 text-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "48px", height: "48px" }}>
                      <FaMotorcycle className="text-primary" size={20} />
                    </div>
                    <h4 className="fw-bold mb-0">{countDelivery}</h4>
                    <small className="text-muted">Entregas</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-3 text-center">
                    <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "48px", height: "48px" }}>
                      <FaRoute className="text-info" size={20} />
                    </div>
                    <h4 className="fw-bold mb-0">{(distanceTotal / 1000).toFixed(1)} km</h4>
                    <small className="text-muted">Recorridos</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Lista de Órdenes */}
            <div className="mb-3">
              <h5 className="fw-semibold mb-3 d-flex align-items-center">
                <span className="bg-secondary bg-opacity-10 rounded-3 p-2 me-2 d-inline-flex">
                  <FaMotorcycle className="text-secondary" />
                </span>
                Pedidos del día
                {ordenes?.length > 0 && (
                  <span className="badge bg-secondary bg-opacity-25 text-secondary ms-2">
                    {ordenes.length}
                  </span>
                )}
              </h5>

              {ordenes?.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="text-center py-5">
                    <FaMotorcycle size={48} className="text-muted opacity-50 mb-3" />
                    <p className="text-muted mb-0">No tienes entregas registradas hoy</p>
                  </Card.Body>
                </Card>
              ) : (
                ordenes.map((order) => (
                  <CourierOrderHistoryCard key={order.id} order={order} />
                ))
              )}
            </div>
          </>
        )}
      </Container>
    </CourierLayout>
  );
};

export { CourierHistory };
