import { Container, } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PaginationComponent from "../../Pagination/index.jsx";
import ListProducts from "./ListProducts.jsx";

import productService from "../../../apis/client/ProductService";
import { useAuth } from "../../../Context/AuthContext.jsx";


const VisualizarProductos = () => {

  const { token } = useAuth()

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);


  const navigate = useNavigate();



  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const limit = 12

        const data = await productService.getAll({ page, limit }, token);
        setProducts(data?.body);
      } catch (error) {
        setError('Error fetching products');
        toast.error('Error al cargar los pedidos');
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const handleCardCreateOrderClick = () => {
    navigate('/CreateProduct');
  }

  return (
    <Container >

      <ListProducts
        products={products}
        loading={loading}
        error={error}
        handleCardClick={handleCardCreateOrderClick}
      />

      <PaginationComponent
        page={page}
        handlePageChange={(newPage) => setSearchParams({ page: newPage })}
      />

    </Container>
  );
}

export { VisualizarProductos };