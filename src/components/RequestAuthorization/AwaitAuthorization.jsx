import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../Loading';
import Layout from '../../Layout/Recepcion';
import { Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config'; // Asegúrate de tener configurado Firebase
import { getIdToken } from 'firebase/auth';

const ENV = import.meta.env;

function AwaitAuthorization({ userId }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Definir una función para verificar el estado de autorización
  const checkAuthorizationStatus = async () => {
    try {
      const token = await getIdToken(auth.currentUser);

      const response = await axios.get(`${ENV.VITE_INTEGRAMELO_API_URL}/api/v3/users/user-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      if (data.userStores !== undefined && data.userStores.length > 0) {
        setAuthorized(true);
        navigate('/dashboard');
      } else {
        setAuthorized(false);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Llamar inmediatamente a la función al montar el componente
    checkAuthorizationStatus();

    // Configurar el intervalo para verificar cada 5 minutos (300,000 ms)
    const intervalId = setInterval(checkAuthorizationStatus, 30000);

    return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
  }, [userId]);

  if (loading) {
    return (
      <Layout>
        <Container fluid className="mt-4">
          <Row className="mt-4">
            <p>Cargando...</p>
            <Loading />
          </Row>
        </Container>
      </Layout>
    );
  }

  if (authorized) {
    return (
      <Layout>
        <p>¡Tu solicitud ha sido aprobada! Ya tienes acceso a la tienda.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container fluid className="mt-4">
        <Row className="mt-4">
          <p>Tu solicitud está pendiente de aprobación. Por favor comunícate con el propietario para que te autorice.</p>
        </Row>
      </Container>
    </Layout>
  );
}

export default AwaitAuthorization;
