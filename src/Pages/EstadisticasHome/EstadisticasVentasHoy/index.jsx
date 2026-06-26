import { useEffect, useState } from 'react'
import { UtilsApi } from '../../../Utils/utilsApi';
import GraficaVentasHoy from '../../../components/GraficaVentasHoy';
 
// import Pedido from '../../../Utils/class/Pedido';
import { Container, Row } from 'react-bootstrap';
import LayoutRecepcion from '../../../Layout/Recepcion';
import { useAuth } from '../../../Context/AuthContext';

//para mostra los pedidos en una tabla y tener las estadistica a la mano 
const EstadisticasVentasHoy = () => {
  const { token } = useAuth()

  //los pedidos qeu se muestran en la tabla
  const [pedidos, setPedidos] = useState([])
  const [pedidosAyer, setPedidosAyer] = useState([])

  //

  const timeInitHoy = new Date();
  timeInitHoy.setHours(15, 0, 0, 0);
  const fechaAyer = new Date();
  fechaAyer.setHours(15, 0, 0, 0);
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
  const conteoDeProductos = (pedidos, producto) => {
    let haburguesas = 0, combos = 0

    pedidos.forEach((pedido) => {
      if (!pedido.order) return
      pedido.order.forEach(producto => {
        // if (producto.type !== `Producto`) return
        pedidos += 1
        switch (producto.id) {
        case `1`:
          combos += 1
          break
        case `2`:
          haburguesas += 1
          break
        default:
          break
        }
      })
    })

    switch (producto) {
    case 'combo':
      return combos
    case 'haburguesa':
      return haburguesas
    default:
      return combos + haburguesas
    }
  }


  const listPedidos = {
    title: 'Ventas',
    nameValueY: 'Numero de ventas',
    graps: [
      {
        name: 'Hoy',
        data: pedidos,
        color: 'rgb(200, 28, 28)',
        dayInit: timeInitHoy,
        backgroundColor: 'rgba(23, 19, 255, 0.47)',
        callbackReduceData: conteoPedidos,
      },
      {
        name: 'Ayer',
        data: pedidosAyer,
        color: 'rgba(0, 0, 0, 0.84)',
        dayInit: fechaAyer,
        backgroundColor: 'rgba(255, 70, 70, 0.94)',
        callbackReduceData: conteoPedidos,
      },
    ]
  }

  const listPedidos2 = {
    title: 'Ventas de los productos',
    nameValueY: 'Cantidad',
    graps: [
      {
        name: 'Hoy Combos',
        data: pedidosAyer,
        color: 'rgb(255, 0, 0)',
        dayInit: timeInitHoy,
        backgroundColor: 'rgba(255, 70, 70, 0.94)',
        callbackReduceData: (data) => { return conteoDeProductos(data, 'combo') },
      },
      {
        name: 'Hoy Hambuguesas',
        data: pedidosAyer,
        color: 'rgb(0, 255, 0)',
        dayInit: timeInitHoy,
        backgroundColor: 'rgba(255, 70, 70, 0.94)',
        callbackReduceData: (data) => { return conteoDeProductos(data, 'haburguesa') },
      },
      {
        name: 'Hoy Productos',
        data: pedidosAyer,
        color: 'rgb(0, 0, 255)',
        dayInit: timeInitHoy,
        backgroundColor: 'rgba(255, 70, 70, 0.94)',
        callbackReduceData: (data) => { return conteoDeProductos(data) },
      },
      {
        name: 'Ayer Combos',
        data: pedidosAyer,
        color: 'rgb(255, 0, 255)',
        dayInit: fechaAyer,
        backgroundColor: 'rgba(255, 70, 70, 0.94)',
        callbackReduceData: (data) => { return conteoDeProductos(data, 'combo') },
      },
      {
        name: 'Ayer Hambuguesas',
        data: pedidosAyer,
        color: 'rgb(255, 255, 0)',
        dayInit: fechaAyer,
        backgroundColor: 'rgba(255, 70, 70, 0.94)',
        callbackReduceData: (data) => { return conteoDeProductos(data, 'haburguesa') },
      },
      {
        name: 'Ayer Pruductos',
        data: pedidosAyer,
        color: 'rgb(0, 255, 255)',
        dayInit: fechaAyer,
        backgroundColor: '',
        callbackReduceData: (data) => { return conteoDeProductos(data) },
      },
    ]
  }


  return (
    <>
      <LayoutRecepcion>
        <Container>
          <Row>

            <GraficaVentasHoy
              listPedidos={listPedidos.graps}
              title={listPedidos.title}
              nameValueY={listPedidos.nameValueY}
            />

            <GraficaVentasHoy
              listPedidos={listPedidos2.graps}
              title={listPedidos2.title}
              nameValueY={listPedidos2.nameValueY}
            />
          </Row>

        </Container>

      </LayoutRecepcion>
    </>
  )
}

export default EstadisticasVentasHoy