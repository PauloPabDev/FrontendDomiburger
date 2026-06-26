import { Container, Spinner, Row, Col } from 'react-bootstrap';
import LayoutAdmin from '../../Layout/Admin.jsx';
import PaginationComponent from '../../components/Pagination/index.jsx';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KitchenService } from '../../apis/clientV2/KitchenService.js';
import { useAuth } from '../../Context/AuthContext.jsx';
import { toast } from 'react-toastify';
import { ADMIN_ROUTES } from '../../Utils/const/namesRutes.js';
import { ListCardsElements } from '../../components/common/ListCards.jsx';
import { KitchenCard } from '../../components/Kitchens/KitchenCard.jsx';

const AdminKitchens = () => {
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { token } = useAuth();
  const kitchensService = new KitchenService(token);

  // Función para obtener los usuarios de la API
  const fetchKitchens = async () => {
    setLoading(true);
    setError(null);
    try {
      const limit = 12;
      const params = { page, limit };

      const data = await kitchensService.getAll(params);
      setKitchens(data?.body || []);
    } catch (error) {
      setError('Error al cargar los usuarios');
      toast.error('Error al cargar los usuarios');
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar la búsqueda cuando cambia la página o el filtro
  useEffect(() => {
    fetchKitchens();
  }, [page]);

  // Función para manejar el cambio de página
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };
  const navigate = useNavigate()


  return (
    <LayoutAdmin>
      <Container fluid className="px-4">
        {/* Título */}
        <Row className="mb-4">
          <Col>
            <h1 className="text-primary fw-bold text-center">Administrar Cocina</h1>
          </Col>
        </Row>

        <Row>
          <Col>
            {loading ?
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" variant="primary" />
              </div> :
              <ListCardsElements
                loading={loading}
                error={error}
                CardComponent={KitchenCard}
                elements={kitchens} handleCardClick={() => navigate(ADMIN_ROUTES.routes.KITCHEN_CREATE)} />
            }
          </Col>
        </Row>

        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <PaginationComponent page={page} handlePageChange={handlePageChange} />
          </Col>
        </Row>
      </Container>
    </LayoutAdmin>
  );
};

export { AdminKitchens };
