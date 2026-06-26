import { ORDER_STATUSES, PAYMENT_METHODS } from "../status"

const statusList = {}

const statusNext = (order) => {
  const currentStatus = order.status


  statusList[ORDER_STATUSES.FRESH] = ORDER_STATUSES.PREPARING
  statusList[ORDER_STATUSES.PREPARING] = ORDER_STATUSES.READY_FOR_PICKUP
  statusList[ORDER_STATUSES.READY_FOR_PICKUP] = ORDER_STATUSES.DISPATCHED
  statusList[ORDER_STATUSES.DISPATCHED] = ORDER_STATUSES.DELIVERED
  statusList[ORDER_STATUSES.DELIVERED] = ORDER_STATUSES.INVOICED
  statusList[ORDER_STATUSES.INVOICED] = ORDER_STATUSES.PENDING_PAYMENT
  statusList[ORDER_STATUSES.PENDING_PAYMENT] = ORDER_STATUSES.INVOICED

  //hacemos una esepcion , si el pago es de tipo tranferiancia   y no esta pagado , le cambiamos el boton para que mande al estado de espera a transferencia
  if (order.payment?.status != 'approved') {
    if (order.status == ORDER_STATUSES.DELIVERED) {
      if (order.paymentMethod == PAYMENT_METHODS.TRANSFER || order.paymentMethod == PAYMENT_METHODS.BANCOLOMBIA || order.paymentMethod == PAYMENT_METHODS.NEQUI) {
          return ORDER_STATUSES.PENDING_PAYMENT
      }
    }
  }
  return statusList[currentStatus]

}

export { statusNext }