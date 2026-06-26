import axios from 'axios';
import { Card, Button } from 'react-bootstrap';
import { useToast } from '../../hooks/useSocket';
import { getIdToken } from 'firebase/auth';
import { auth } from '../../firebase/config';

const ENV = import.meta.env;

const CardRequestAutorizations = ({ id, name, email, storeId, onRequestUpdate }) => {
  const notify = useToast();

  // Función para manejar la autorización de la solicitud
  const handleAuthorization = async () => {
    try {
      const token = await getIdToken(auth.currentUser);
      const response = await axios.post(`${ENV.VITE_INTEGRAMELO_API_URL}/api/v3/stores/${storeId}/authorizationRequests/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // Notificar al componente padre para actualizar la lista de solicitudes
        onRequestUpdate(id);
        // Notificar al usuario sobre el éxito
        notify.notifySuccess('¡Solicitud aprobada exitosamente!');
      }
    } catch (error) {
      // Manejar error y notificar al usuario
      notify.notifyError('Error al aprobar la solicitud. Por favor, inténtalo nuevamente.');
    }
  };

  // Función para manejar el rechazo de la solicitud
  const handleReject = async () => {
    try {
      const token = await getIdToken(auth.currentUser);
      const response = await axios.post(`${ENV.VITE_INTEGRAMELO_API_URL}/api/v3/stores/${storeId}/authorizationRequests/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // Notificar al componente padre para actualizar la lista de solicitudes
        onRequestUpdate(id);
        // Notificar al usuario sobre el éxito
        notify.notifySuccess('Solicitud rechazada correctamente.');
      }
    } catch (error) {
      // Manejar error y notificar al usuario
      notify.notifyError('Error al rechazar la solicitud. Por favor, inténtalo nuevamente.');
    }
  };

  return (
    <Card className="m-3" style={{ borderRadius: '15px' }}>
      <Card.Body>
        <div className='d-flex justify-content-between align-items-center'>
          <div>
            <Card.Title>{name}</Card.Title>
            <p>{email}</p>
          </div>
          <div>
            <Button variant="primary" onClick={handleAuthorization}>Autorizar</Button>
            <Button variant="danger" className="ms-2" onClick={handleReject}>Rechazar</Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CardRequestAutorizations;
