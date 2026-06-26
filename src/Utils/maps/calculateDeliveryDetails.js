import { obtenerDistancia } from "../../Pages/Recepcion/FormAdmin/googleDistanceMatrix";
import { calcularPrecio, calcularTiempo } from "../matrixCalculate";

const calculateDeliveryDetails = async (centerOrigin, coordinates) => {
  const dataMatrix = await obtenerDistancia(centerOrigin, coordinates);

  if (dataMatrix) {
    const timeText = calcularTiempo(dataMatrix.duration.value);
    const price = calcularPrecio(dataMatrix.distance.value);
    if (!timeText || (!price && price !== 0)) {
      throw new Error('No se pudo calcular el precio del domicilio');
    }

    return {
      timeText,
      price,
    }
  }
};

export { calculateDeliveryDetails };