import { Card, Button, Spinner, Alert, ListGroup, Badge } from "react-bootstrap";
import { useGetKitchenByLocation } from "../../../hooks/api/kitchens/useGetKitchenByLocation";
import { useEffect, useState } from "react";
import InfoButton from "../../../components/InfoButton";
import { DisabledComponent } from "../../../components/common/DisabledComponent";

const KitchenAndDeliveryInfoClient = ({
  kitchen,
  setKitchen,
  delivery,
  setDelivery,
  kitchenIdSelect,
  locationIdSelect,
  onViewSchedulesAndKitchens,
}) => {
  const { error, data: responseKitchenAndDelivery, loading, fetchKitchen } = useGetKitchenByLocation();
  const [kitchenNotAvailable, setKitchenNotAvailable] = useState(false);

  useEffect(() => {
    if (locationIdSelect) fetchKitchen(locationIdSelect, kitchenIdSelect);
  }, [locationIdSelect, kitchenIdSelect]);

  useEffect(() => {

    if (responseKitchenAndDelivery?.kitchen) {
      setKitchen(responseKitchenAndDelivery.kitchen);
      setKitchenNotAvailable(false);
    }
    if (responseKitchenAndDelivery?.delivery) setDelivery(responseKitchenAndDelivery.delivery);

    if (responseKitchenAndDelivery?.kitchen === null) {
      setKitchenNotAvailable(true);
    }

  }, [responseKitchenAndDelivery]);

  return (
    <Card className="shadow-sm">
      <Card.Body className="position-relative">
        {/* Spinner de carga */}
        {loading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
            style={{ zIndex: 10 }}
          >
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        )}

        {/* Mensajes de error o advertencia */}
        {!locationIdSelect && (
          <Alert variant="warning" className="mb-3">
            ⚠️ Por favor, selecciona una dirección para continuar.
          </Alert>
        )}
        {error && (
          <Alert variant="danger" className="mb-3">
            ❌ Error: {error.message}
          </Alert>
        )}

        <Card.Title className="mb-4">📦 Información de Cocina y Domicilio</Card.Title>

        <ListGroup variant="flush">
          <ListGroup.Item className="d-flex justify-content-between align-items-center">
            <span>
              <strong>Nombre de la Cocina:</strong>
            </span>
            <span className="fs-4">
              {kitchen ?
                <Badge bg="primary" className="fs-5">{kitchen.name}</Badge> :
                <Badge bg="secondary">No disponible</Badge>}
            </span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between align-items-center">
            <span>
              <strong>Distancia:</strong>
            </span>
            <span className="fs-5">
              {delivery && delivery.distance ?
                <Badge bg="secondary">{parseFloat(delivery.distance / 1000).toFixed(2)} km</Badge>
                :
                <Badge bg="secondary">N/A</Badge>
              }
            </span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between align-items-center position-relative">
            <span className="position-relative">
              <strong>Costo del domicilio
                <InfoButton
                  textInfo="El costo del domicilio se calcula según los metros de distancia entre la dirección y la cocina mas cercana abierta"
                  color="primary"
                  classButton='btn btn-link m-0 p-1'
                />:</strong>

            </span>
            <span className="fs-6">
              {delivery && delivery.price !== undefined ?
                <Badge bg="secondary">${delivery.price.toLocaleString()}</Badge> :
                <Badge bg="secondary">No disponible</Badge>
              }
            </span>
          </ListGroup.Item>
        </ListGroup>

        {kitchenNotAvailable && (
          <Alert variant="danger" className="mt-3">
            No se encontraron cocinas disponibles en este horario. Consulta nuestros horarios de las cocinas
          </Alert>
        )}
      </Card.Body>

      <Card.Footer className="text-end">
        <DisabledComponent
          message={'Esta funcionalidad estará disponible próximamente'}>
          <Button
            disabled
            variant=""
            onClick={onViewSchedulesAndKitchens}
            className="btn-outline-primary"
          >
            Ver Horarios y Cocinas
          </Button>
        </DisabledComponent>
      </Card.Footer >
    </Card >
  );
};

export { KitchenAndDeliveryInfoClient };
