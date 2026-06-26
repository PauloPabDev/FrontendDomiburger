import { useContext, useEffect, useState } from 'react'
import { UtilsApi } from '../../../Utils/utilsApi';
import ListEstadisticasDomiciliarios from '../../../components/ListEstadisticasDomiciliarios';
import { ConfigProvider, theme } from 'antd';
import LayoutRecepcion from '../../../Layout/Recepcion';
import { PreferencesContext } from '../../../Context/PreferencesContext';
import { useAuth } from '../../../Context/AuthContext';

//para mostra los pedidos en una tabla y tener las estadistica a la mano 
const EstadisticasDomiciliarios = () => {
  const { isDarkMode } = useContext(PreferencesContext);

  const { token } = useAuth()

  //los pedidos qeu se muestran en la tabla
  const [pedidos, setPedidos] = useState([])
  //pedimos todos lo pedios del dia
  useEffect(() => {
    UtilsApi({ peticion: `pedidos/historialDia`, token, vervo: `GET` })
      .then(data => {
        data = data.map(e => e.data)
        setPedidos(data)
      })
      .catch(() => {})
  }, [token])




  return (
    <>
      <LayoutRecepcion>
        <ConfigProvider
          theme={{
            algorithm: isDarkMode ? theme.darkAlgorithm : null,
          }}
        >
          <ListEstadisticasDomiciliarios
            pedidos={pedidos}
          />
        </ConfigProvider>
      </LayoutRecepcion>
    </>
  )
}

export default EstadisticasDomiciliarios