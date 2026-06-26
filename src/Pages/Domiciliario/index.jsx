import { useEffect, useState } from "react";
import { useMiContexto } from "../../Context";
import { NavbarDomiciliario } from "../../components/Navbar/NavbarDomiciliario";
import Layout from "../../components/Layout";
import Mapa from "../../components/MapsGoogle";
import ListMarker from "../../components/ListMarker";
import { Container, Row } from "react-bootstrap";
import CarouselListCards from "../../components/CarouselListCards";
import { useWorker } from "../../Context/WorkerContext";
import { usePreferences } from "../../Context/PreferencesContext";
import { LocationsService } from "../../apis/clientV2/LocationsService";
import { useAuth } from "../../Context/AuthContext";

const Domiciliario = () => {
  const { items, zoomMaps, setZoomMaps } = useMiContexto();
  const { idOrderSelect } = useWorker();
  const { isDarkMode } = usePreferences();
  const { token } = useAuth();

  const [centerMaps, setCenterMaps] = useState({
    lat: 6.29,
    lng: -75.576,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      if (idOrderSelect !== null && items?.length) {
        const item = items.find((pedido) => pedido.id === idOrderSelect);
        if (!item) return;

        try {
          const locationService = new LocationsService(token);
          const location = await locationService.getById(item.locationId);

          if (location?.body?.coordinates) {
            setCenterMaps({
              lat: location.body.coordinates.lat || centerMaps.lat,
              lng: location.body.coordinates.lng || centerMaps.lng,
            });
          }
        } catch (error) {
        }
      }
    };

    fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrderSelect, items, token]);

  const containerStyle = {
    width: "100%",
    height: "50vh",
  };

  return (
    <Layout>
      <NavbarDomiciliario pedidos={items} />
      <Container fluid>
        <Row className="mb-3">
          <Mapa
            zoom={zoomMaps}
            setZoomMaps={setZoomMaps}
            modoOscuro={isDarkMode}
            center={centerMaps}
            setCenter={setCenterMaps}
            containerStyle={containerStyle}
          >
            {items && <ListMarker pedidos={items} />}
          </Mapa>
        </Row>
        <Row>
          <CarouselListCards data={items} />
        </Row>
      </Container>
    </Layout>
  );
};

export default Domiciliario;
