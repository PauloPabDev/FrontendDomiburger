import { UtilsApi } from "../utilsApi"

export const findClientForId = async (id, token) => {
  try {

    const url = `clientes/id?id=${id}`
    const res = await UtilsApi({
      peticion: url, token, vervo: 'GET',
    })

    const dataCliente = res
    return dataCliente
  } catch (error) {
    return null
  }
}