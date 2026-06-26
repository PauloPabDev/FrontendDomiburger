import { Button, Container, InputGroup, Form, Spinner, Row, Col } from 'react-bootstrap';
import LayoutAdmin from '../../Layout/Admin';
import PaginationComponent from '../../components/Pagination';
import { ListCardsElements } from '../../components/common/ListCards';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UsersService } from '../../apis/clientV2/usersService';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';
import { UserCard } from '../../components/Users/UserCard';

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailSearch, setEmailSearch] = useState('');
  const [filter, setFilter] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { token } = useAuth();
  const usersService = useMemo(() => new UsersService(token), [token]);

  // Función para obtener los usuarios de la API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const limit = 12;
      const params = { page, limit };

      const data = await usersService.getAll(params, filter);
      setUsers(data?.body || []);
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
    fetchUsers();
  }, [page]);

  // Función para manejar el cambio de página
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  return (
    <LayoutAdmin>
      <Container fluid className="px-4">
        {/* Título */}
        <Row className="mb-4">
          <Col>
            <h1 className="text-primary fw-bold text-center">Administrar Usuarios</h1>
          </Col>
        </Row>

        {/* Buscador */}
        <Row className="mb-4 justify-content-center">
          <Col md={6} lg={4}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Buscar por email..."
                value={emailSearch}
                onChange={(e) => {
                  setEmailSearch(e.target.value);
                  setFilter({ key: 'email', value: e.target.value, option: '==' });
                }}
              />
              <Button variant="primary" onClick={fetchUsers}>
                <FaSearch />
              </Button>
            </InputGroup>
          </Col>
        </Row>

        {/* Contenido */}
        <Row>
          <Col>
            {/* Spinner mientras carga */}
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <ListCardsElements
                elements={users} loading={loading} error={error}
                handleCardClick={() => toast.info('No se puede crear un usuario desde aquí')}
                CardComponent={UserCard} messageText='Crear un Usuario'
              />
            )}
          </Col>
        </Row>

        {/* Paginación */}
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <PaginationComponent page={page} handlePageChange={handlePageChange} />
          </Col>
        </Row>
      </Container>
    </LayoutAdmin>
  );
};

export { AdminUser };
