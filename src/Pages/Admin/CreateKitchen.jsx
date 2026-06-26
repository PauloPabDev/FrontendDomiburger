import { useState } from 'react';
import Joi from 'joi';
import { Container, Row, Col, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { KitchenService } from '../../apis/clientV2/KitchenService';
import { useAuth } from '../../Context/AuthContext';
import LayoutAdmin from '../../Layout/Admin';
import { useNavigate } from 'react-router-dom';

// Esquema de validación con Joi
const createKitchenSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    'any.required': 'El nombre es obligatorio',
    'string.min': 'El nombre debe tener al menos 3 caracteres',
  }),
  locationId: Joi.string().required().messages({
    'any.required': 'Se necesita una ubicación',
    'string.guid': 'ID de ubicación no válido',
  }),
  phone: Joi.string().pattern(/^\d{10}$/).required().messages({
    'any.required': 'El teléfono es obligatorio',
    'string.pattern.base': 'El teléfono debe tener 10 dígitos',
  }),
  eventOpenCalendar: Joi.string().required().messages({
    'any.required': 'El evento de apertura del calendario es obligatorio',
  }),
});

const CreateKitchen = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState('');

  const [phone, setPhone] = useState('');

  const [eventOpenCalendar, setEventOpenCalendar] = useState('')

  const kitchensService = new KitchenService(token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    const formData = {
      name,
      locationId,
      phone,
      eventOpenCalendar
    };

    const validation = createKitchenSchema.validate(formData, { abortEarly: false });
    if (validation.error) {
      const formattedErrors = validation.error.details.reduce(
        (acc, curr) => ({ ...acc, [curr.context.key]: curr.message }),
        {}
      );
      setErrors(formattedErrors);
      toast.error('Error en la validación del formulario');
      setLoading(false);
      return;
    }

    try {

      await kitchensService.create(formData);
      toast.success('¡Cocina creada exitosamente!');

      setName('');
      setLocationId('');
      setPhone('');
      setEventOpenCalendar('')
      navigate(-1);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutAdmin>
      <Container className="mt-4">
        <Row>
          <Col md={{ span: 8, offset: 2 }}>
            <h1 className="mb-4 text-center text-primary">Crear Nueva Cocina</h1>

            {error && <Alert variant="danger">Error: {error.message}</Alert>}

            {/* Campo Nombre */}
            <Form.Group className="mb-3" controlId="name">
              <Form.Label className="fw-bold">Nombre de la Cocina</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Cocina Central"
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            {/* Campo LocationId */}
            <Form.Group className="mb-3" controlId="locationId">
              <Form.Label className="fw-bold">ID de Ubicación</Form.Label>
              <Form.Control
                type="text"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                placeholder="Ej: f502827b-c069-4c83-bcca-d8cc98278dda"
                isInvalid={!!errors.locationId}
              />
              <Form.Control.Feedback type="invalid">{errors.locationId}</Form.Control.Feedback>
            </Form.Group>

            {/* Campo Teléfono */}
            <Form.Group className="mb-3" controlId="phone">
              <Form.Label className="fw-bold">Teléfono</Form.Label>
              <Form.Control
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 5519379342"
                isInvalid={!!errors.phone}
              />
              <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
            </Form.Group>

            {/* Campo Evento de Apertura del Calendario */}
            <Form.Group className="mb-3" controlId="eventOpenCalendar">
              <Form.Label className="fw-bold">Evento de Apertura del Calendario</Form.Label>
              <Form.Control
                as="textarea"
                value={eventOpenCalendar}
                onChange={(e) => setEventOpenCalendar((e.target.value).replace(/\\n/g, '\n'))}
                placeholder="Ej: Evento de apertura"
                isInvalid={!!errors.eventOpenCalendar}
              />
              <Form.Control.Feedback type="invalid">{errors.eventOpenCalendar}</Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-center mt-4 mb-4">
              <Button
                variant="primary"
                type="submit"
                onClick={handleSubmit}
                size="lg"
                className="px-4 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Creando...
                  </>
                ) : (
                  'Crear Cocina'
                )}
              </Button>
            </div>

          </Col>
        </Row>
      </Container>
    </LayoutAdmin>
  );
};

export { CreateKitchen };
