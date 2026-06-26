// src/pages/Contabilidad.jsx
import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Row, Spinner, Alert } from 'react-bootstrap';
import { MiContexto } from '../../Context';
import TablaListaPedidos from "../../components/TablaListaPedidos";
import { UtilsApi } from '../../Utils/utilsApi';
import FormulariFiltros from '../../components/FormulariFiltros';
import EstadisticasDashboard from '../../components/EstadisticasDashboard';
import LayoutRecepcion from '../../Layout/Recepcion';

const calcularEstadisticas = (pedidosData) => {
  let totalDeVentas = 0,
    numeroDeVentas = 0,
    NumeroDeRegistros = pedidosData.length,
    totalDeTrasferencias = 0,
    totalDeEfectivo = 0,
    totalDeCombos = 0,
    totalDeHamburguesas = 0,
    totalDeSalsaDeAjo = 0,
    totalDeDomicilios = 0,
    TotalDeCostosProductos = 0,
    TotalDeCostosGaseosas = 0,
    totalDeGaseosas = 0;

  // Función auxiliar para contar adiciones de gaseosas
  const contieneAdicionGaseosa = (adiciones, idAdicion) => {
    if (typeof idAdicion === 'string') idAdicion = [idAdicion];
    let contadorProducto = 0, contadorCosteProducto = 0;
    adiciones.forEach(adicion => {
      if (idAdicion.includes(adicion.id)) {
        contadorProducto += 1;
        contadorCosteProducto += adicion.price || 0;
      }
    });
    return { contadorProducto, contadorCosteProducto };
  };

  pedidosData.forEach(element => {
    if (element.estado === 'Eliminados') return;

    numeroDeVentas += 1;
    totalDeVentas += element.priceTotal?.priceTotal || 0;

    if (element?.pagoConfirmado?.confirmado) {
      if (element.fee === 'Efectivo') {
        totalDeEfectivo += element.priceTotal?.priceTotal || 0;
      } else if (element.fee === 'Transferencia') {
        totalDeTrasferencias += element.priceTotal?.priceTotal || 0;
      }
    }

    let comboContador = 0,
      hamburguesaContador = 0,
      salsaDeAjoContador = 0,
      domicilioContador = 0;

    element.order.forEach(producto => {
      switch (producto.id) {
      case '1':
        comboContador += 1;
        TotalDeCostosProductos += producto.price || 0;
        break;
      case '2':
        hamburguesaContador += 1;
        TotalDeCostosProductos += producto.price || 0;
        break;
      case '38':
        salsaDeAjoContador += 1;
        break;
      default:
        if (producto.type === 'domicilio') {
          domicilioContador += producto.price || 0;
        }
        break;
      }
      const { contadorProducto, contadorCosteProducto } = contieneAdicionGaseosa(producto.modifique || [], ['9', '10']);
      totalDeGaseosas += contadorProducto;
      TotalDeCostosGaseosas += contadorCosteProducto;
    });

    totalDeCombos += comboContador;
    totalDeHamburguesas += hamburguesaContador;
    totalDeSalsaDeAjo += salsaDeAjoContador;
    totalDeDomicilios += domicilioContador;
  });

  return {
    totalDeVentas,
    numeroDeVentas,
    NumeroDeRegistros,
    totalDeTrasferencias,
    totalDeEfectivo,
    totalDeCombos,
    totalDeHamburguesas,
    totalDeSalsaDeAjo,
    totalDeDomicilios,
    TotalDeCostosProductos,
    TotalDeCostosGaseosas,
    totalDeGaseosas,
  };
};

const Contabilidad = () => {
  const { tokenLogin } = useContext(MiContexto);
  const token = tokenLogin?.token;

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar pedidos del día
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    UtilsApi({ peticion: 'pedidos/historialDia', token, vervo: 'GET' })
      .then(data => {
        const pedidosData = data.map(e => e.data);
        setPedidos(pedidosData);
      })
      .catch(err => {
        setError('Error al cargar los pedidos.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Función para filtrar pedidos
  const buscarPorFiltro = useCallback(async (arrayFilter) => {
    const filtrosValidos = arrayFilter.filter(e => e != null);
    if (filtrosValidos.length <= 0) return;
    const filterBody = JSON.stringify({ filter: filtrosValidos });
    setLoading(true);
    try {
      const data = await UtilsApi({ peticion: 'estados/filter', token, vervo: 'POST', body: filterBody });
      const pedidosFiltrados = data.map(e => e.data);
      setPedidos(pedidosFiltrados);
    } catch (err) {
      setError('Error al filtrar los pedidos.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Calcular estadísticas solo cuando cambie el listado de pedidos
  const estadisticas = useMemo(() => calcularEstadisticas(pedidos), [pedidos]);

  return (
    <LayoutRecepcion>
      <Container fluid>
        <Row className="my-3">
          <FormulariFiltros onBuscar={buscarPorFiltro} />
        </Row>

        {loading && (
          <Row className="justify-content-center my-3">
            <Spinner animation="border" variant="primary" />
          </Row>
        )}

        {error && (
          <Row className="my-3">
            <Alert variant="danger">{error}</Alert>
          </Row>
        )}

        {/* Visualizamos las estadísticas usando el componente Dashboard */}
        <Row className="mb-3">
          <EstadisticasDashboard stats={estadisticas} />
        </Row>

        <Row>
          <TablaListaPedidos pedidos={pedidos} />
        </Row>
      </Container>
    </LayoutRecepcion>
  );
};

export default Contabilidad;
