import { useContext, useEffect, useState } from 'react'
import { MiContexto } from '../../../Context'
import Layout from "../../../components/Layout";
import { Container, Row } from 'react-bootstrap';
import TablaListaPedidos from '../../../components/TablaListaPedidos';
import { UtilsApi } from '../../../Utils/utilsApi';
import { convertirFecha2 } from "../../../Utils/formatTime"

//para el tema oscuro de antd
import { ConfigProvider, theme } from 'antd';
import ProgressDataDomiciliario from '../../../components/ProgressDataDomiciliario';
import { NavbarDomiciliario } from '../../../components/Navbar/NavbarDomiciliario';
import { useAuth } from '../../../Context/AuthContext';

const DomiciliarioHistory = () => {
  const context = useContext(MiContexto)

  const { token } = useAuth()
  const id = useAuth()?.usuarioActual?.uid
  //los pedidos qeu se muestran en la tabla
  const [pedidos, setPedidos] = useState([])
  const fechaStr = new Date()
  const fecha = new Date(fechaStr);

  // Restar un día
  fecha.setDate(fecha.getDate() - 1);
  const diaAnteriorStr = fecha.toISOString().split('T')[0];

  useEffect(() => {
    const dataFilter = [{
      key: `date`,
      "options": ">=",
      "type": "Date",
      "value": convertirFecha2(diaAnteriorStr)
    }, {
      key: `domiciliario_asignado.id`,
      options: `==`,
      value: id
    }]

    const filter = JSON.stringify({ filter: dataFilter })
    UtilsApi({ peticion: `estados/filter`, token, vervo: `POST`, body: filter })
      .then(data => {
        data = data.map(e => e.data)
        setPedidos(data)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <> <ConfigProvider
      theme={{
        // 1. Use dark algorithm
        algorithm: context.modoOscuro ? theme.darkAlgorithm : null,
        // 2. Combine dark algorithm and compact algorithm
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}
    >

      <Layout>
        <NavbarDomiciliario
          modoOscuro={context.modoOscuro}
          alternarModo={context.alternarModo}
          pedidos={context.items}
        />
        <Container fluid  >

          <Row className='m-5'>
            <div className='d-flex justify-content-center align-items-center'>
              <ProgressDataDomiciliario
                pedidos={pedidos}
              />
            </div>
          </Row>

          <Row  >
            <TablaListaPedidos
              pedidos={pedidos}
            />
          </Row>
        </Container>
      </Layout >
    </ConfigProvider>
    </>
  );
}

export default DomiciliarioHistory