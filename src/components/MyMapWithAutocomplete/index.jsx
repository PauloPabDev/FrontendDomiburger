import { useState, useEffect, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { BsFillGeoAltFill } from 'react-icons/bs';
import { Form, FormControl, InputGroup } from 'react-bootstrap';

const mapContainerStyle = {
  height: '12rem',
};

const MyMapWithAutocomplete = ({ objAdrees, setObjAdrees, VITE_KEYMAPS }) => {
  return (
    <Wrapper apiKey={VITE_KEYMAPS} libraries={['places', 'geometry']}>
      <MapComponent objAdrees={objAdrees} setObjAdrees={setObjAdrees} />
    </Wrapper>
  );
};

export default MyMapWithAutocomplete;

const MapComponent = ({ objAdrees, setObjAdrees }) => {
  const centerOrigin = { lat: 6.3017314, lng: -75.5743796 };

  const [center, setCenter] = useState(centerOrigin);

  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);

  // Inicializa el mapa
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 16,
        disableDefaultUI: true,
        draggable: false,
        scrollwheel: false,
        restriction: {
          latLngBounds: {
            north: centerOrigin.lat + 0.5,
            south: centerOrigin.lat - 0.5,
            east: centerOrigin.lng + 0.5,
            west: centerOrigin.lng - 0.5,
          },
          strictBounds: true,
        },
      });
      mapInstanceRef.current = map;

      // Agrega el marcador
      const marker = new window.google.maps.Marker({
        position: center,
        map: map,
        draggable: false,
      });
      markerRef.current = marker;

      // Agrega la InfoWindow
      const infoWindow = new window.google.maps.InfoWindow({
        content: '<div style="color: black;">Estoy aquí</div>',
        position: center,
      });
      infoWindow.open(map, marker);
      infoWindowRef.current = infoWindow;
    }
  }, [mapRef.current]);

  // Actualiza el centro del mapa y la posición del marcador cuando cambia 'center'
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
    if (markerRef.current) {
      markerRef.current.setPosition(center);
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.setPosition(center);
    }
  }, [center]);

  // Inicializa Autocomplete
  useEffect(() => {
    if (inputRef.current) {
      const options = {
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(centerOrigin.lat - 0.5, centerOrigin.lng - 0.5),
          new window.google.maps.LatLng(centerOrigin.lat + 0.5, centerOrigin.lng + 0.5)
        ),
        componentRestrictions: { country: 'CO' },
        fields: ['geometry', 'formatted_address'],
      };
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, options);

      autocomplete.addListener('place_changed', async () => {
        const place = autocomplete.getPlace();
        if (!place?.geometry) {
          return;
        }

        const { lat, lng } = place.geometry.location;
        const coordenadasInput = { lat: lat(), lng: lng() };
        setCenter(coordenadasInput);

        const dataMatrix = await getDistanceMatrix(coordenadasInput);

        setObjAdrees({
          ...objAdrees,
          address_complete: place.formatted_address,
          type: 'placesAutocomplete',
          valid: true,
          dataMatrix,
          coordinates: coordenadasInput,
          direccionInput: place.formatted_address,
        });
      });
    }
  }, [inputRef.current]);

  // Función para obtener la matriz de distancia
  const getDistanceMatrix = (destino) => {
    return new Promise((resolve) => {
      const service = new window.google.maps.DistanceMatrixService();
      const modoTransporte = window.google.maps.TravelMode.TWO_WHEELER;
      service.getDistanceMatrix(
        {
          origins: [centerOrigin],
          destinations: [destino],
          travelMode: modoTransporte,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
          durationInTraffic: true,
        },
        (response, status) => {
          if (status === 'OK' && response?.rows[0]?.elements[0]) {
            resolve(response.rows[0].elements[0]);
          } else {
            resolve(null);
          }
        }
      );
    });
  };

  // Maneja cambios en el input
  const onChange = (event) => {
    const value = event.target.value;
    setObjAdrees({ ...objAdrees, direccionInput: value });
  };

  return (
    <div className="m-3">
      <Form.Group className="mb-3">
        <Form.Label htmlFor="adress">Dirección Completa</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <BsFillGeoAltFill />
          </InputGroup.Text>
          <FormControl
            id="adress"
            required
            type="text"
            placeholder="Calle 103 # 74b 214"
            ref={inputRef}
            value={objAdrees?.direccionInput || ''}
            onChange={onChange}
            autoComplete="off"
          />
        </InputGroup>
      </Form.Group>

      {objAdrees?.valid && (
        <div ref={mapRef} style={mapContainerStyle} />
      )}
    </div>
  );
};
