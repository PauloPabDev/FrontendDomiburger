import { Container, Spinner, Row, Col } from 'react-bootstrap';
import LayoutAdmin from '../../Layout/Admin';
import PaginationComponent from '../../components/Pagination';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProductsService } from '../../apis/clientV2/ProductsService';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'react-toastify';
import { ADMIN_ROUTES } from '../../Utils/const/namesRutes';
import { ListCardsElements } from '../../components/common/ListCards';
import { ProductCard } from "../../components/Products/ProductCard";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { token } = useAuth();
  const productsService = useMemo(() => new ProductsService(token), [token]);

  // Función para obtener los productos desde la API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const limit = 12;
      const params = { page, limit };
      const data = await productsService.getAll(params);
      setProducts(data?.body || []);
    } catch (error) {
      setError('Error al cargar los productos');
      toast.error('Error al cargar los productos');
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(ADMIN_ROUTES.routes.CREATE_PRODUCT);
  };

  // Maneja el cambio de página
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  return (
    <LayoutAdmin>
      <Container fluid className="px-4 py-3">
        {/* Título */}
        <Row className="mb-4">
          <Col xs={12}>
            <h1 className="text-primary fw-bold text-center">Administrar Productos</h1>
          </Col>
        </Row>

        {/* Contenido */}
        <Row>
          <Col md={10} lg={10} className="mx-auto">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <ListCardsElements
                elements={products}
                loading={loading}
                error={error}
                handleCardClick={handleCardClick}
                CardComponent={ProductCard}
                messageText="Crear un Producto"
              />
            )}
          </Col>
        </Row>

        {/* Paginación */}
        <Row className="mt-4">
          <Col xs={12} className="d-flex justify-content-center">
            <PaginationComponent page={page} handlePageChange={handlePageChange} />
          </Col>
        </Row>
      </Container>
    </LayoutAdmin >
  );
};

export { AdminProducts };
