import { Line, } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// import Pedido from '../../Utils/class/Pedido';
import { convertirHoraDeUnixADate } from '../../Utils/formatTime';
import { Lapso } from '../../Utils/class/LapsoEstadisticas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const GraficaCLientesNuevos = ({ listPedidos, title, nameValueY }) => {

  const timePart = 900; // en segundos

  const dataEstadisticas = listPedidos.map(pedidos => {
    let { labels, dataData } = OrganisarDatosEstadisticas({ listPedidos: pedidos.data, timePart: timePart, dayInit: pedidos.dayInit, callbackReduceData: pedidos.callbackReduceData });
    return { labels, dataData, name: pedidos.name, color: pedidos.color }
  })

  const datasets = dataEstadisticas.map(e => {
    return {
      label: e.name,
      data: e.dataData,
      backgroundColor: e.backgroundColor,
      borderColor: e.color,
      borderWidth: 2,
      tension: 0.4
    }
  })
  // Datos de ejemplo para la gráfica
  const data = {
    labels: dataEstadisticas[0].labels,
    datasets: datasets,
  };

  return (
    <div>
      <h2>Estadísticas de ventas de hoy</h2>
      <Line data={data} options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: title
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: nameValueY
            },
            suggestedMin: 0,
            // suggestedMax: 200
          }
        }
      }} />
    </div>
  );
};



function OrganisarDatosEstadisticas({ listPedidos, timePart, dayInit = undefined, callbackReduceData }) {
  const listPedidosMod = [...listPedidos];

  const listPedidsOrganisado = ordenarPorFecha(listPedidosMod);


  const timeInit = new Date(dayInit)
  timeInit.setHours(15, 0, 0, 0);
  const timeFinality = new Date(dayInit)
  timeFinality.setHours(23, 0, 0, 0);


  // separamos los pedidos en bloques del lapso establecido
  let lapsoActual = timeInit;
  /** @type {Lapso[]} */
  const listaLapsos = [];

  for (let index = 0; lapsoActual < timeFinality; index++) {
    const fechaInitMod = new Date(timeInit);
    fechaInitMod.setTime(fechaInitMod.getTime() + (timePart * index) * 1000);

    const lapso = new Lapso({
      timeInit: lapsoActual,
      timeFinality: fechaInitMod,
    });
    listaLapsos.push(lapso);
    lapsoActual = fechaInitMod;

  }


  listPedidsOrganisado.forEach(pedido => {
    const horaPedido = convertirHoraDeUnixADate(pedido.date);

    const lapsoAdecuado = listaLapsos.findIndex(lapso => {

      if (horaPedido >= lapso.timeInit) {

        if (horaPedido <= lapso.timeFinality) {
          return true;
        }
      }
      return false;
    });

    if (lapsoAdecuado != -1) {
      listaLapsos[lapsoAdecuado].addPedido(pedido);
    }
  });


  let labels = [];
  let dataData = [];


  listaLapsos.forEach(lapso => {
    labels.push(lapso.timeText);
    dataData.push(callbackReduceData(lapso.pedidos));
  });
  return { labels, dataData };
}

function ordenarPorFecha(array) {
  return array.sort((a, b) => convertirHoraDeUnixADate(a.date) - convertirHoraDeUnixADate(b.date));
}


export default GraficaCLientesNuevos;
