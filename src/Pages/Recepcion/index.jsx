import { useContext } from 'react';
import { MiContexto } from '../../Context';
import { RecepcionContexto } from '../../Context/RecepcionContex';
import { Container, ToastContainer, Row, Col } from 'react-bootstrap';
import RowListCol from "../../components/RowListCol";
import { ColsPedidos } from '../../components/ColsPedidos';
import SelectListDomiciliarios from '../../components/SelectListDomiciliarios';
import LayoutRecepcion from '../../Layout/Recepcion';
import Sidebar from '../../components/Sidebar';
import { KitchenActiveBanner } from '../../components/Kitchens/KitchenActiveBanner';

const RecepcionContent = () => {
  // Contexto global (por ejemplo, para los pedidos)
  const context = useContext(MiContexto);
  // Contexto específico de recepción (para controlar el sidebar, etc.)
  const recepcionContext = useContext(RecepcionContexto);
  const showSidebar = recepcionContext.openSidebarFilterDelivery;

  return (
    <>
      <Container fluid className="pt-2">
        <KitchenActiveBanner />
        <Row>
          {/* Si showSidebar es true, se renderiza el Sidebar */}
          {showSidebar && <Sidebar />}
          <Col xs={showSidebar ? 9 : 12} md={showSidebar ? 10 : 12}>
            <RowListCol>
              <ColsPedidos pedidos={context.items ? context.items : []} />
            </RowListCol>
          </Col>
        </Row>
      </Container>
      <ToastContainer position="bottom-left" />
      <SelectListDomiciliarios />
    </>
  );
};


// Componente principal que envuelve al contenido con los Providers
const Recepcion = () => {
  return (
    <LayoutRecepcion>
      <RecepcionContent />
    </LayoutRecepcion>
  );
};

export default Recepcion;
