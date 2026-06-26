import { useEffect, useState } from 'react';
import { useMiContexto } from '../../../Context';
import { useRecepcion } from '../../../Context/RecepcionContex';
import { Col, Container, Row } from 'react-bootstrap';
import Mapa from '../../../components/MapsGoogle';
import SelectListDomiciliarios from '../../../components/SelectListDomiciliarios';
import Sidebar from '../../../components/Sidebar';
import ListOrder from './ListOrder';
import LayoutRecepcion from '../../../Layout/Recepcion';
import CarouselListCards from '../../../components/CarouselListCards';
import { useWorker } from '../../../Context/WorkerContext';
import { useResponsive } from '../../../hooks/useResponsive';

const MapRecepcionContent = () => {
  const { isDesktop } = useResponsive();
  // Uso de los contextos dentro del componente contenido, ya que aquí se encuentran envueltos por el Provider.
  const { items, zoomMaps, setZoomMaps, idItemSelect, kitchenSelectId } = useMiContexto();
  const { openSidebarFilterDelivery } = useRecepcion();
  //el centro es donde esta la cocina seleccionada
  const { listKitchens } = useWorker();
  const kitchen = listKitchens.find((kitchen) => kitchen.id === kitchenSelectId);
  const origin = kitchen?.location?.coordinates;
  const [centerMaps, setCenterMaps] = useState(origin);

  // Altura del mapa responsiva: 50vh en móvil, 90vh en desktop
  const containerStyle = {
    width: '100%',
    height: isDesktop ? '90vh' : '50vh',
  };

  useEffect(() => {
    if (idItemSelect) {
    }
  }, [idItemSelect]);

  return (
    <>
      <Container fluid className="px-0 px-lg-2">
        <Row className="g-0 flex-column flex-lg-row">
          {/* Sidebar de filtros - solo visible en desktop */}
          {openSidebarFilterDelivery && <Sidebar />}

          {/* Sección del Mapa */}
          <Col
            xs={12}
            lg={openSidebarFilterDelivery ? 7 : 9}
          >
            <Mapa
              zoom={zoomMaps}
              setZoomMaps={setZoomMaps}
              center={centerMaps}
              setCenter={setCenterMaps}
              containerStyle={containerStyle}
            >
              <ListOrder items={items || []} />
            </Mapa>
          </Col>

          {/* Sección de Órdenes - derecha en desktop, abajo en móvil */}
          <Col xs={12} lg={openSidebarFilterDelivery ? 3 : 3}>
            <CarouselListCards data={items || []} vertical={isDesktop} />
          </Col>
        </Row>
      </Container>

      <SelectListDomiciliarios />
    </>
  );
};

const MapRecepcion = () => {
  return (
    <LayoutRecepcion>
      {/* Se envuelve el contenido con el Provider correspondiente para que los hooks useContext funcionen correctamente */}
      <MapRecepcionContent />
    </LayoutRecepcion>
  );
};

export default MapRecepcion;
