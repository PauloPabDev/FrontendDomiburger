import { statusOrderCol } from '../../Utils/listStatus';

const generateSvgColor = (color) => {
  const iconMarker = {
    path: "m -0.55 -29.9954 c -8.4296 0 -18.2734 5.1562 -18.2734 18.2734 c 0 8.8984 14.0546 28.5704 18.2734 33.7266 c 3.75 -5.1562 18.2734 -24.3594 18.2734 -33.7266 c 0 -13.1172 -9.8438 -18.2734 -18.2734 -18.2734 z m 0 0",
    fillColor: color,
    fillOpacity: 2,
    // anchor: { x: 18.4, y: 18.4 },
    // origin: { x: 50, y: 100 }
  };
  return iconMarker
}
const iconMarker = (estado) => {
  //cambia el color del marker (svg) según  el estado
  const markerColorStates = (estate) => {
    const color = statusOrderCol[estate].color
    if (!color) return generateSvgColor("#000000")

    const rta = generateSvgColor(color)
    return rta
  }
  if (!estado) return generateSvgColor("#000000")

  return markerColorStates(estado)
}

export { iconMarker }