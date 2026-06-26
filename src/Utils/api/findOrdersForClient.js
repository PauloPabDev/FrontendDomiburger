import { UtilsApi } from "../utilsApi"

export const findClientForPhone = async (telefono, token) => {
  try {
    const data = {
      filter: [
        {
          "key": "phone",
          "type": "phone",
          "value": telefono,
          "options": "=="
        }
      ]
    }
    const url = `clientes/filter`
    const res = await UtilsApi({
      peticion: url, token, vervo: 'POST', body: JSON.stringify(data)
    })
    if (!res[0]) {
      throw null
    }
    const dataCliente = res[0].data
    return dataCliente
  } catch (error) {
    return null
  }
}