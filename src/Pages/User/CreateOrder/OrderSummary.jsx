import { Button, Container, Card, ListGroup, Row, Col, Alert, Spinner } from "react-bootstrap";
import { NavigationButtons } from "./NavigationButtons";
import { useAuth } from "../../../Context/AuthContext";
import { LocationCardReduce } from "../../../components/Locations/LocationCardReduce";
import { useEffect, useMemo, useState, useCallback } from "react";
import { KitchenService } from "../../../apis/clientV2/KitchenService";
import { OrderService } from "../../../apis/clientV2/OrderService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../../Utils/const/namesRutes";

const OrderSummary = ({ onPrev, location, productOrderList = [], comment, paymentMethod }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [kitchen, setKitchen] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loadingDelivery, setLoadingDelivery] = useState(true);
  const [errorDelivery, setErrorDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null);

  const { usuarioActual, token } = useAuth();
  const kitchenService = useMemo(() => new KitchenService(token), [token]);
  const orderService = useMemo(() => new OrderService(token), [token]);
  const navigate = useNavigate();

  // Calcular el precio total sumando los productos y el costo de envío
  useEffect(() => {
    let total = productOrderList.reduce((sum, product) => sum + (product.price || 0), 0);
    if (delivery) total += delivery.price || 0;
    setTotalPrice(total);
  }, [productOrderList, delivery]);

  // Obtener información de la cocina y costos de entrega
  useEffect(() => {
    const calculateDistance = async () => {
      if (!location?.id) return;

      setLoadingDelivery(true);
      setErrorDelivery(null);

      try {
        const rta = await kitchenService.getSelectKitchen(location.id);
        setKitchen(rta.data.body?.kitchen || null);
        setDelivery(rta.data.body?.delivery || null);
      } catch (err) {
        setErrorDelivery("Error obteniendo la información de la cocina.");
      } finally {
        setLoadingDelivery(false);
      }
    };

    calculateDistance();
  }, [location, kitchenService]);

  // Enviar orden de compra
  const sendOrder = useCallback(async () => {
    if (!location?.id || !productOrderList.length || !kitchen) {
      toast.error("Faltan datos para completar la orden.");
      return;
    }

    const data = {
      locationId: location.id,
      delivery,
      comment,
      paymentMethod: paymentMethod || "cash",
      assignedKitchenId: kitchen.id,
      orderItems: productOrderList.map(product => ({ id: product.id, quantity: 1 })),
    };

    setLoading(true);
    setError(null);

    try {
      const rta = await orderService.create(data);
      toast.success(rta.data.message);
      navigate(USER_ROUTES.routes.THANKS);
    } catch (err) {
      setError("Error al procesar la orden. Intenta nuevamente.");
      toast.error(err.response.data?.message || "Error al procesar la orden. Intenta nuevamente.")
    } finally {
      setLoading(false);
    }
  }, [location, delivery, comment, paymentMethod, kitchen, productOrderList, orderService, navigate]);

  return (
    <Container>
      <h2 className="fw-bold mt-3 mb-4 text-center">Resumen del Pedido</h2>

      {/* Ubicación */}
      <Card className="mb-3">
        <Card.Header className="fw-bold">Ubicación de Entrega</Card.Header>
        <Card.Body>
          {location ? <LocationCardReduce location={location} /> : <Alert variant="warning">No se ha seleccionado una ubicación.</Alert>}
        </Card.Body>
      </Card>

      {/* Datos del usuario */}
      <Card className="mb-3">
        <Card.Header className="fw-bold">Datos del Cliente</Card.Header>
        <Card.Body>
          <p><strong>Nombre:</strong> {usuarioActual?.displayName || "Nombre no disponible"}</p>
          <p><strong>Teléfono:</strong> {usuarioActual?.phoneNumber || "Teléfono no disponible"}</p>
        </Card.Body>
      </Card>

      {/* Comentario y método de pago */}
      <Card className="mb-3">
        <Card.Header className="fw-bold">Detalles del Pedido</Card.Header>
        <Card.Body>
          <p><strong>Comentario:</strong> {comment || "Sin comentarios"}</p>
          <p><strong>Método de pago:</strong> {paymentMethod || "No seleccionado"}</p>
        </Card.Body>
      </Card>

      {/* Información de la cocina y distancia */}
      <Card className="mb-3">
        <Card.Header className="fw-bold">Detalles de Envío</Card.Header>
        <Card.Body>
          {loadingDelivery ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Calculando distancia...</span>
              </Spinner>
            </div>
          ) : errorDelivery ? (
            <Alert variant="danger">{errorDelivery}</Alert>
          ) : kitchen ? (
            <>
              <p><strong>Cocina Asignada:</strong> {kitchen.name || "No disponible"}</p>
              <p><strong>Distancia:</strong> {(delivery?.distance / 1000).toFixed(2) || "0.00"} km</p>
              <p><strong>Tiempo Estimado:</strong> {delivery?.duration || "No disponible"} min</p>
              <p><strong>Costo de Envío:</strong> ${delivery?.price?.toFixed(2) || "0.00"}</p>
            </>
          ) : (
            <Alert variant="warning">No se pudo encontrar una cocina cercana.</Alert>
          )}
        </Card.Body>
      </Card>

      {/* Lista de productos */}
      <Card className="mb-3">
        <Card.Header className="fw-bold">Productos en el Pedido</Card.Header>
        <ListGroup variant="flush">
          {productOrderList.length > 0 ? (
            productOrderList.map((product, index) => (
              <ListGroup.Item key={index}>
                <Row>
                  <Col xs={8}><strong>{product.name}</strong></Col>
                  <Col xs={4} className="text-end">${product.price?.toFixed(2) || "0.00"}</Col>
                </Row>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>
              <Alert variant="warning" className="mb-0">No hay productos en el pedido.</Alert>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>

      {/* Total del pedido */}
      <Card className="mb-3">
        <Card.Header className="fw-bold">Total a Pagar</Card.Header>
        <Card.Body className="text-end fs-4 fw-bold">
          ${totalPrice.toFixed(2)}
        </Card.Body>
      </Card>

      {/* Botón de comprar */}
      <div className="text-center mb-4">
        <Button onClick={sendOrder} variant="primary" size="lg" disabled={productOrderList.length === 0 || loadingDelivery || loading}>
          {loading ? <Spinner animation="border" size="sm" className="me-2" /> : "Comprar"}
        </Button>
      </div>

      <div className="p-3"></div>


      {/* Botones de navegación */}
      <NavigationButtons onPrev={onPrev} />
    </Container>
  );
};

export { OrderSummary };
