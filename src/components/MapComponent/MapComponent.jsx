import { useState, useRef, useEffect } from "react";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import FormField from "../FormField";
import { BsFillGeoAltFill } from "react-icons/bs";
import { Button, Col, Row, Modal } from "react-bootstrap";
import WhatsAppButton from "../WhatsAppButton";
import "./MapComponent.css";
import { MAP_BOUNDS_OFFSET } from "../../Utils/const/locations";


const MapComponent = ({ center, stateCoordenadas, stateDireccion, errors }) => {
  const [errorCoordinates, errorAdress] = errors;
  const [coordinates, setCoordinates] = stateCoordenadas;
  const [direccion, setDireccion] = stateDireccion;
  const [manualSelect, setManualSelect] = useState(false);
  const [showHelp, setShowHelp] = useState(false); // Estado para el diálogo de ayuda
  const autocompleteRef = useRef(null);

  const handleHelpOpen = () => setShowHelp(true);
  const handleHelpClose = () => setShowHelp(false);

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setCoordinates({ lat, lng });
    setDireccion({
      ...direccion,
      address_complete: place.formatted_address,
      valid: true,
      type: "autocompleted",
    });

    setManualSelect(false);
  };

  const handleMapClick = (e) => {
    if (!manualSelect) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setCoordinates({ lat, lng });

    setDireccion({
      ...direccion,
      type: "manual",
      valid: !!direccion.address_complete,
    });
  };

  const handleInputChange = (e) => {
    setDireccion({
      ...direccion,
      address_complete: e.target.value,
      valid: false,
    });
  };

  useEffect(() => {
    setDireccion({ ...direccion, valid: false });
  }, [direccion.address_complete]);

  const handleMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setCoordinates({ lat, lng });
  };

  return (
    <form autoComplete="off" className="mb-3" >
      <Autocomplete Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        bounds={{
          north: center.lat + MAP_BOUNDS_OFFSET,
          south: center.lat - MAP_BOUNDS_OFFSET,
          east: center.lng + MAP_BOUNDS_OFFSET,
          west: center.lng - MAP_BOUNDS_OFFSET,
        }}
        fields={["geometry", "name", "formatted_address", "address_components", "types"]}
        options={{
          componentRestrictions: { country: ["CO"] },
          strictBounds: true,
        }}
        onPlaceChanged={onPlaceChanged}
      >
        <FormField
          style={{ zIndex: 1000000 }}
          id="direccion"
          label="Dirección"
          type="text"
          icon={<BsFillGeoAltFill />}
          placeholder="Ejemplo: Calle 103d # 76 12"
          value={direccion.address_complete}
          onChange={handleInputChange}
          error={errorAdress}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        />
      </Autocomplete>

      <Row className="align-items-center mb-3">
        {errorCoordinates && <div className="text-danger">{errorCoordinates}</div>}

        <Col xs={12} md={8} className="d-flex align-items-center">
          <p className="mb-0 me-3">
            <strong>Instrucciones:</strong> Si tienes problemas con la dirección, selecciónala en el mapa.
          </p>
          <Button
            variant="outline-primary"
            onClick={handleHelpOpen}
            className="btn-sm px-3"
            style={{
              fontWeight: "bold",
              borderRadius: "20px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            Ayuda
          </Button>
        </Col>
        <Col xs={12} md={4}>
          <Button
            variant={manualSelect ? "danger" : "primary"}
            onClick={() => setManualSelect(!manualSelect)}
            className="w-100"
            style={{
              fontWeight: "bold",
              borderRadius: "8px",
              transition: "background-color 0.3s ease",
            }}
          >
            {manualSelect ? "Desactivar selección manual" : "Seleccionar manualmente"}
          </Button>
        </Col>
      </Row>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "200px" }}
        center={coordinates.lat ? coordinates : center}
        zoom={14}
        onClick={handleMapClick}
        options={{
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: window.google.maps.ControlPosition.TOP_LEFT,
            mapTypeIds: ["roadmap", "terrain"],
          },
          streetViewControl: false,
          restriction: {
            latLngBounds: {
              north: center.lat + 0.5,
              south: center.lat - 0.5,
              east: center.lng + 0.5,
              west: center.lng - 1,
            },
            strictBounds: false,
          },
        }}
      >
        {coordinates.lat && (
          <Marker
            position={coordinates}
            draggable={manualSelect}
            onDragEnd={handleMarkerDragEnd}
            label={":)"}
          />
        )}
      </GoogleMap>

      {/* Modal de Ayuda */}
      <Modal show={showHelp} onHide={handleHelpClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ayuda</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h5 className="mb-3 text-primary">Cómo agregar tu dirección:</h5>
            <ol className="ps-3">
              <li className="mb-2">
                Ingresa tu dirección en el campo de texto; aparecerá una lista de direcciones. Selecciona una sugerencia.
              </li>
              <li className="mb-2">
                Si no te aparecen opciones, borra el último número y vuelve a escribirlo.
              </li>
              <li className="mb-2">
                Si prefieres, activa la selección manual y haz clic en el mapa para elegir una ubicación.
              </li>
              <li className="mb-2">
                Arrastra el marcador en el mapa para ajustar la posición si es necesario.
              </li>
              <li>
                Asegúrate de que el campo de dirección tenga algún valor escrito.
              </li>
            </ol>
          </div>

          <div className="mt-4">
            <p className="mb-3">
              <strong>¿Necesitas más ayuda?</strong>
            </p>
            <p className="mb-4">
              Contacta a soporte técnico a través de WhatsApp haciendo clic en el botón a continuación.
            </p>
            <div className="text-center">
              <WhatsAppButton
                message="Tengo problemas con la dirección de mi pedido a la hora de crearlo en la página"
                phoneNumber="+573506186772"
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleHelpClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </form >
  );
};

export default MapComponent;
