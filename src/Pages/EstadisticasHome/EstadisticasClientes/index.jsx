import { useEffect, useState } from 'react'
import { UtilsApi } from '../../../Utils/utilsApi';
import GraficaCLientesNuevos from '../../../components/GraficaCLientesNuevos';
 
// import Pedido from '../../../Utils/class/Pedido';
import LayoutRecepcion from '../../../Layout/Recepcion';
import { useAuth } from '../../../Context/AuthContext';

//para mostra los pedidos en una tabla y tener las estadistica a la mano 
const EstadisticasClientes = () => {
  const { token } = useAuth()

  //los pedidos qeu se muestran en la tabla
  const [pedidos, setPedidos] = useState([])
  const [pedidosAyer, setPedidosAyer] = useState([])

  //

  const timeInitHoy = new Date();
  timeInitHoy.setHours(15, 0, 0, 0);
  const fechaAyer = new Date();
  fechaAyer.setDate(fechaAyer.getDate() - 1);

  //pedimos todos lo pedios del dia
  useEffect(() => {
    UtilsApi({ peticion: `pedidos/historialDia`, token, vervo: `GET` })
      .then(data => {
        data = data.map(e => e.data)
        setPedidos(data)
      })
      .catch(() => {})



    const filter = [{
      "key": "date",
      "options": ">=",
      "type": "Date",
      "value": fechaAyer
    }]
    UtilsApi({
      peticion: `/estados/filter`, token, vervo: `POST`, body: JSON.stringify({ filter })
    })
      .then(data => {
        data = data.map(e => e.data)
        setPedidosAyer(data)
      })
      .catch(() => {})


  }, [token])




  /**
   * @param {Pedido[]} pedidos
   */
  const conteoPedidos = (pedidos) => {
    return pedidos.length
  }

  /**
 * @param {Pedido[]} pedidos
 */


  const listPedidos = {
    title: 'Clientes nuevos',
    graps: [
      {
        name: 'Hoy',
        data: pedidos,
        color: 'rgb(200, 28, 28)',
        dayInit: timeInitHoy,
        backgroundColor: 'rgba(23, 19, 255, 0.47)',
        callbackReduceData: conteoPedidos
      },
      {
        name: 'Ayer',
        data: pedidosAyer,
        color: 'rgba(0, 0, 0, 0.84)',
        dayInit: fechaAyer,
        backgroundColor: 'rgba(255, 70, 70, 0.94)',
        callbackReduceData: conteoPedidos
      },
    ]
  }



  return (
    <>
      <LayoutRecepcion>

        <GraficaCLientesNuevos
          listPedidos={listPedidos.graps}
          title={listPedidos.title}
          nameValueY={listPedidos.nameValueY}
        />

      </LayoutRecepcion>
    </>
  )
}

export default EstadisticasClientes