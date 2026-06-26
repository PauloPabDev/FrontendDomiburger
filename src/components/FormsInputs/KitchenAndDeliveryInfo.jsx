import { useEffect, useState } from 'react';
import { Spinner, Card, Row, Col, Container, Alert, Form, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../Context/AuthContext';
import { KitchenService } from '../../apis/clientV2/KitchenService';
import { toast } from 'react-toastify';

const KitchenAndDeliveryInfo = ({
  kitchen,
  setKitchen,
  delivery,
  setDelivery,
  kitchenIdSelect,
  locationIdSelect,
}) => {
  const [loading, setLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState(null);
  const { token } = useAuth();
  const kitchenService = new KitchenService(token);

  useEffect(() => {
    if (!locationIdSelect) return;

    const fetchKitchenAndDelivery = async () => {
      setDelivery(null);
      setKitchen(null);
      try {
        const response = await kitchenService.getSelectKitchen(locationIdSelect, kitchenIdSelect);
        const data = response.data.body;
        setDelivery(data.delivery || null);
        setKitchen(data.kitchen || null);
        setOriginalPrice(data.delivery ? data.delivery.price : null);
      } catch (error) {
        toast.error('Error obteniendo la información de la cocina.');
        setDelivery(null);
        setKitchen(null);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchKitchenAndDelivery();
  }, [locationIdSelect, kitchenIdSelect]);

  const handlePriceChange = (e) => {
    setNewPrice(e.target.value);
  };

  const handleSavePrice = () => {
    if (newPrice !== '' && !isNaN(newPrice)) {
      setDelivery((prevDelivery) => ({
        ...prevDelivery,
        price: parseFloat(newPrice),
        modified: true,
      }));
      setEditingPrice(false);
      toast.success('Precio de delivery actualizado.');
    } else {
      toast.error('Por favor ingresa un precio válido.');
    }
  };

  const handleResetPrice = () => {
    setDelivery((prevDelivery) => ({
      ...prevDelivery,
      price: originalPrice,
      modified: false,
    }));
    toast.success('Precio de delivery reseteado al original.');
  };

  return (
    <Container className="my-4">
      <h3 className="text-center mb-4">Información de Cocina y Delivery</h3>
      {loading ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {!kitchen && !delivery && (
            <Alert variant="info" className="text-center">
              No se encontró información para mostrar.
            </Alert>
          )}
          <Row>
            {kitchen && (
              <Col md={6} className="mb-3">
                <Card border="primary" className="shadow-sm">
                  <Card.Header as="h5" className="bg-primary text-white">
                    Cocina
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>{kitchen.name}</Card.Title>
                    <Card.Text>
                      <strong>ID:</strong> {kitchen.id} <br />
                      <strong>Dirección:</strong> {kitchen.address || 'No disponible'} <br />
                      <strong>Teléfono:</strong> {kitchen.phone || 'N/A'} <br />
                      <strong>Órdenes Diarias:</strong> {kitchen.dailyOrders || 0}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            )}
            {delivery && (
              <Col md={6} className="mb-3">
                <Card border="success" className="shadow-sm">
                  <Card.Header as="h5" className="bg-success text-white">
                    Delivery
                    {delivery.modified && (
                      <Badge variant="warning" className="ml-2">
                        Modificado
                      </Badge>
                    )}
                  </Card.Header>
                  <Card.Body>
                    {editingPrice ? (
                      <>
                        <Form.Group>
                          <Form.Label>Nuevo Precio</Form.Label>
                          <Form.Control
                            type="number"
                            value={newPrice}
                            onChange={handlePriceChange}
                            placeholder="Ingrese el nuevo precio"
                          />
                        </Form.Group>
                        <Button variant="primary" onClick={handleSavePrice} className="mt-2">
                          Guardar
                        </Button>
                        <Button variant="secondary" onClick={() => setEditingPrice(false)} className="mt-2 ml-2">
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Card.Text>
                          <strong>Precio:</strong> {delivery.price} COP <br />
                          <strong>Distancia:</strong> {delivery.distance} metros <br />
                          <strong>Duración:</strong> {delivery.duration} segundos
                        </Card.Text>
                        <Button variant="warning" onClick={() => setEditingPrice(true)}>
                          Editar Precio
                        </Button>
                        {delivery.modified && (
                          <Button variant="danger" onClick={handleResetPrice} className="ml-2">
                            Resetear Precio
                          </Button>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </>
      )}
    </Container>
  );
};

export { KitchenAndDeliveryInfo };