import { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaRedo, FaExternalLinkAlt } from 'react-icons/fa';
import { LocationsService } from '../../../apis/clientV2/LocationsService';
import { useAuth } from '../../../Context/AuthContext';

const ClientLocations = ({ clientId }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchLocations = async () => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const locationsService = new LocationsService(token);
      const data = await locationsService.getByIdClient(clientId);
      setLocations(data?.body || data || []);
    } catch (err) {
      setError('Error al cargar las ubicaciones');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [clientId, token]);

  const openInMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white">
          <FaMapMarkerAlt className="me-2" />
          Direcciones Guardadas
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-2 text-muted">Cargando direcciones...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white">
          <FaMapMarkerAlt className="me-2" />
          Direcciones Guardadas
        </Card.Header>
        <Card.Body>
          <Alert variant="danger" className="mb-0">
            {error}
            <Button variant="link" size="sm" onClick={fetchLocations}>
              <FaRedo className="me-1" /> Reintentar
            </Button>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
        <span>
          <FaMapMarkerAlt className="me-2" />
          Direcciones Guardadas ({locations.length})
        </span>
        <Button variant="light" size="sm" onClick={fetchLocations}>
          <FaRedo />
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        {locations.length === 0 ? (
          <Alert variant="info" className="m-3 mb-0">
            Este cliente no tiene direcciones guardadas.
          </Alert>
        ) : (
          <ListGroup variant="flush">
            {locations.map((location, index) => (
              <ListGroup.Item
                key={location.id || index}
                className="d-flex justify-content-between align-items-start"
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <FaMapMarkerAlt className="text-danger me-2" />
                    <strong>{location.name || location.alias || `Direccion ${index + 1}`}</strong>
                    {location.isDefault && (
                      <Badge bg="primary" className="ms-2">Principal</Badge>
                    )}
                  </div>
                  <p className="mb-1 text-muted small">
                    {location.address_complete || location.address || 'Sin direccion'}
                  </p>
                  {location.reference && (
                    <p className="mb-1 text-muted small">
                      <em>Ref: {location.reference}</em>
                    </p>
                  )}
                  <div className="d-flex align-items-center gap-2 mt-1">
                    {location.verified !== undefined && (
                      <small className={location.verified ? 'text-success' : 'text-warning'}>
                        {location.verified ? (
                          <><FaCheckCircle className="me-1" /> Verificada</>
                        ) : (
                          <><FaTimesCircle className="me-1" /> Sin verificar</>
                        )}
                      </small>
                    )}
                    {location.coordinates && (
                      <small className="text-muted">
                        ({location.coordinates.lat?.toFixed(4)}, {location.coordinates.lng?.toFixed(4)})
                      </small>
                    )}
                  </div>
                </div>
                {location.coordinates && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => openInMaps(location.coordinates.lat, location.coordinates.lng)}
                    title="Ver en Google Maps"
                  >
                    <FaExternalLinkAlt />
                  </Button>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export { ClientLocations };
