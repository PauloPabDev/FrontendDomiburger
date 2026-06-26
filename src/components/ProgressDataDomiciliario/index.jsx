import formatearNumeroConPuntos from '../../Utils/formatearNumeroConPuntos';
import { Progress } from 'antd';

const ProgressDataDomiciliario = ({ pedidos }) => {

  const rtaEstadisticas = (pedidosData) => {
    let totalDeVentas = 0,
      numeroDeVentas = 0,
      NumeroDeRegistros = pedidosData.length,
      totalDeTrasferencias = 0,
      totalDeEfectivo = 0,
      totalDeCombos = 0,
      totalDeHamburguesas = 0,
      totalDeDomicilios = 0,
      TotalDeCostosProductos = 0

    pedidosData.forEach(element => {
      // element = element.data

      //conatamos el valor de las ventas
      //si el pedido esta en eliminanos no se contarar en el total de dle valor de venta
      // deberia de retornar si el estado es elmininadso para aurar tantoa codiogo 
      if (element.estado == 'Eliminados') {
        return
      }

      numeroDeVentas += 1
      totalDeVentas += element.priceTotal.priceTotal

      ///miramso si es de de efectivo o tranferencia 

      if (element?.pagoConfirmado?.confirmado) {
        if (element.fee == 'Efectivo') {
          totalDeEfectivo += element.priceTotal.priceTotal
        } else if (element.fee == 'Transferencia') {
          totalDeTrasferencias += element.priceTotal.priceTotal
        }
      }

      //constamso la cantiddad de combos 
      let comboContador = 0
      let hamburguesaContador = 0
      let domicilioContador = 0

      element.order.forEach(producto => {
        switch (producto.id) {
        case `1`:
          comboContador += 1
          TotalDeCostosProductos += producto.price
          break;
        case `2`:
          hamburguesaContador += 1
          TotalDeCostosProductos += producto.price
          break
        default:
          if (producto.type == 'domicilio') {
            domicilioContador += producto.price
          }
          break;
        }
      })

      totalDeCombos += comboContador
      totalDeHamburguesas += hamburguesaContador
      totalDeDomicilios += domicilioContador
      //si es de tranferecia miramos si estas confiramado le pago y los  separamos
    });

    return {
      totalDeVentas,
      numeroDeVentas,
      NumeroDeRegistros,
      totalDeTrasferencias,
      totalDeEfectivo,
      totalDeCombos,
      totalDeHamburguesas,
      totalDeDomicilios,
      TotalDeCostosProductos,
    }
  }

  const rta = rtaEstadisticas(pedidos)

  const porsentaje = (rta.totalDeDomicilios * 100 / 80000)
  const rtaKilometrosAprox = (pedidosData) => {
    let kilometros = 0
    pedidosData.forEach(element => {

      element.order.forEach(producto => {
        if (producto.type == 'domicilio') {
          kilometros = kilometros + producto.distance.value
        } else {
        }
      })

    })
    kilometros = parseInt(kilometros / 1000)
    return kilometros
  }

  const km = rtaKilometrosAprox(pedidos)

  return (
    <>
      <div className=''>
        <Progress size={250} type="dashboard" percent={porsentaje} format={() => (<><div className='m-2'>{formatearNumeroConPuntos(rta.totalDeDomicilios)}</div>
          <small >{rta.NumeroDeRegistros} </small><span style={{ fontSize: '0.8rem' }}> {km}km</span></>)} />
      </div>

    </>
  )
}

export default ProgressDataDomiciliario