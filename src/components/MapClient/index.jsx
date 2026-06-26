import { Container } from "react-bootstrap"
import Mapa from "../../components/MapsGoogle"
import { useEffect, useState } from "react";
import { Marker } from "@react-google-maps/api";
import { useContext } from 'react';
import { MiContexto } from '../../Context';

const MapClient = ({ coordinates }) => {
  const context = useContext(MiContexto)

  const [centerMaps, setCenterMaps] = useState({
    lat: 6.29,
    lng: -75.576
  })
  useEffect(() => {
    if (coordinates === undefined) return
    setCenterMaps(coordinates)
  }, [coordinates])

  const containerStyle = {
    width: '100%', // Establece el ancho al 100% del contenedor padre
    height: '20vh', // Establece la altura al 100% de la altura de la ventana
  };

  return (
    <>
      <Container fluid  >
        <Mapa
          zoom={15}
          setZoomMaps={() => { }}
          modoOscuro={context.modoOscuro}
          center={centerMaps}
          setCenter={setCenterMaps}
          containerStyle={containerStyle}
        >
          {
            coordinates !== undefined &&
            <Marker
              position={coordinates}
              title='title'
              animation='DROP'
              label={``}
              clickable={true}
              // icon={iconMarker}
              visible={true}
            // onClick={() => {
            //   const index = context.items.findIndex(e => e.id == pedido.id)
            //   context.setIdItemSelect(index == -1 ? null : index)
            // }}
            />
          }
        </Mapa>
      </Container>
    </>
  )
}

export default MapClient