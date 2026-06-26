import { useEffect, useState } from 'react';
import Joi from 'joi';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useLoadScript } from '@react-google-maps/api';
import { toast } from 'react-toastify';

import MapComponent from '../../components/MapComponent/MapComponent';
import { TypeAndFloorInput } from '../../components/FormsInputs/TypeAndFloorInput';
import { NotesInput } from '../../components/FormsInputs/NotesInput';
import { UserLayout } from '../../Layout/UserLayout';
import { LOCATIONS } from '../../Utils/const/locations';
import { useConfetti } from '../../hooks/useConfetti';
import { useCreateLocation } from '../../hooks/api/locations/useCreateLocation';

const ENV = import.meta.env;

const LIBRARIES = ['places'];

const listTypes = Object.values(LOCATIONS).map((location) => location.value);

const createLocationSchema = Joi.object({
  address: Joi.string().min(3).max(255).required().messages({ 'any.required': 'Establece una dirección', 'string.min': 'La dirección debe tener al menos 3 caracteres', 'string.empty': 'Debes ingresar un valor' }),
  state: Joi.string().min(3).max(255).optional(),
  floor: Joi.string().max(255).required().messages({ 'any.required': 'Necesitamos el piso o apartamento', 'string.min': 'El piso debe tener al menos 3 caracteres', 'string.empty': 'Debes ingresar un valor' }),
  city: Joi.string().min(3).max(255).optional(),
  country: Joi.string().min(3).max(255).optional(),
  postalCode: Joi.string().min(3).max(255).optional(),
  coordinates: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }).required().messages({ 'any.required': 'Necesitamos las coordenadas , necesitas ayudas?' }),
  comment: Joi.string().min(3).max(255).optional(),
  propertyType: Joi.string().valid(...listTypes).required(),
});

const CreateLocation = () => {
  //hook para sotat un confeti
  const fireConfetti = useConfetti();
  const successForm = () => {
    toast.success('¡Ubicación creada exitosamente!');

    fireConfetti();
  }
  return (
    <UserLayout>
      <Container className="mt-4">
        <Row>
          <CreateLocationComponent successForm={successForm} />
        </Row>
      </Container>
    </UserLayout>
  );
};

const CreateLocationComponent = ({ successForm, isAnonymous, clientId }) => {

  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const [validationErrors, setValidationErrors] = useState([]);

  const centerOrigin = { lat: 6.3017314, lng: -75.5743796 };
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: ENV.VITE_KEYMAPS,
    libraries: LIBRARIES, // Usas la misma referencia siempre
  });

  const [coordinates, setCoordinates] = useState({});
  const [inputDataDireccion, setInputDataDireccion] = useState({
    address_complete: "",
    valid: false,
  });

  const [floor, setFloor] = useState('');
  const [propertyType, setPropertyType] = useState('house');
  const [notes, setNotes] = useState('');

  const { sendLocation, sendLocationAnonymous, error: errorApi, loading } = useCreateLocation();

  useEffect(() => {
    if (errorApi) {
      toast.error(`Error: ${errorApi}`);
      setError({ message: errorApi });
    }
  }, [errorApi]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors([]);
    setErrors({});

    const formData = {
      address: inputDataDireccion.address_complete,
      floor,
      propertyType,
      coordinates,
    };

    notes ? (formData.comment = notes) : null

    const ho = createLocationSchema.validate(formData, { abortEarly: false });
    const error = ho.error;
    if (error) {
      const formattedErrors = error.details.reduce((acc, curr) => ({ ...acc, [curr.context.key]: curr.message }), {});
      setErrors(formattedErrors);
      toast.error("Error en la validación del formulario");
      return;
    }


    try {

      if (clientId === null && !isAnonymous) throw new Error('debes de tener un cliente');
      if (clientId) {
        formData.clientId = clientId;
      }

      const rta = isAnonymous ? await sendLocation(formData) : await sendLocationAnonymous(formData);

      setFloor('');
      setPropertyType('');
      setNotes('');
      setCoordinates({});
      setInputDataDireccion({ address_complete: "", valid: false });

      successForm(rta.body);
      // setTimeout(() => navigate(-1), 2000); // Redirige a la página anterior después de 2 segundos

    } catch (err) {
      toast.error(`Error: ${err.message}`);
      setError(err);
    }
  };

  return (
    <Col  >
      <h1 className="mb-4">Crear Nueva Ubicación</h1>
      {
        validationErrors.length > 0 && (
          <Alert variant="danger">
            <ul>
              {validationErrors.map((errMsg, index) => (
                <li key={index}>{errMsg}</li>
              ))}
            </ul>
          </Alert>
        )
      }

      {isLoaded && (
        <MapComponent
          center={centerOrigin}
          stateCoordenadas={[coordinates, setCoordinates]}
          stateDireccion={[inputDataDireccion, setInputDataDireccion]}
          errors={[errors?.lat, errors.address]}
        />
      )}

      <TypeAndFloorInput
        floor={floor}
        setFloor={setFloor}
        errors={[errors.floor, errors.propertyType]}
        propertyType={propertyType}
        setPropertyType={setPropertyType}
      />

      <NotesInput notes={notes} setNotes={setNotes} error={errors.notes} />

      <div className="d-flex justify-content-center mt-4 mb-4">
        <Button
          variant="primary"
          type="submit"
          onClick={handleSubmit}
          size="lg"
          className="px-4 py-2"
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Creando...
            </>
          ) : (
            'Crear Ubicación'
          )}
        </Button>
      </div>
      {error && <Alert variant="danger">Error: {error.message}</Alert>}
    </Col >
  )
}

export { CreateLocation, CreateLocationComponent };