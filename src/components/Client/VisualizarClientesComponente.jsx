import { Container, } from "react-bootstrap";
import PaginationComponent from "../Pagination";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import clientService from "../../apis/client/ClientService";
import ClientList from "./ClientList";
import { toast } from "react-toastify";
import BuscadorCliente from "../Codigos/CrearCodigoReferido/BuscadorCliente";
import BuscadorClientePorNombre from "../Codigos/CrearCodigoReferido/BuscadorClientePorNombre";
import { useAuth } from "../../Context/AuthContext";


const VisualizarClientesComponente = () => {

  const { token } = useAuth()

  const [clients, setClients] = useState([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);

  const [telefono, setTelefono] = useState('');
  const [dataCliente, setDataCliente] = useState(null);


  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);


  const navigate = useNavigate();

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  }


  useEffect(() => {
    const fetchFocus = async () => {
      try {
        const limit = 10;

        const data = await clientService.getAll({ page, limit });
        setClients(data?.body);
      } catch (error) {
        setError('Error fetching clientes');
        toast.error('Error al cargar los clientes');
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFocus();
  }, [page]);

  const handleCardCreateClientClick = () => {
    toast.success('showCreateClientModal');
    //los mandamos a la pagina de crear cliente con react router
    navigate('/client/create');
  }

  return (
    <Container >

      <BuscadorCliente
        telefono={telefono}
        setTelefono={setTelefono}
        dataCliente={dataCliente}
        setDataCliente={setDataCliente}
        token={token}
        visibleDataClient={true}
      />

      {/* buscar por nombre */}
      <BuscadorClientePorNombre
        token={token}
        setClients={setClients}
      />

      {/* ver card de cada cliente */}
      <ClientList clients={clients} handleCardCreateClientClick={handleCardCreateClientClick} />

      <PaginationComponent
        page={page}
        handlePageChange={handlePageChange}
      />
      {/* modal para crear a un cliente */}

    </Container>
  );
}

export { VisualizarClientesComponente };