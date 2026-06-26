import { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Form, Button, Accordion } from 'react-bootstrap';
import { toast } from 'react-toastify';
import InputCantidadNumber from '../CrearCodigoReferido/InputCantidadNumber';
import BuscadorCliente from '../CrearCodigoReferido/BuscadorCliente';
import { findCodigo } from '../../../Utils/api/codigos/findCodigo';
import { updateCodigo } from '../../../Utils/api/codigos/update';

const EditarCodigoReferido = ({ token, id }) => {
  const [codigo, setCodigo] = useState(null);
  const [telefono, setTelefono] = useState('');
  const [dataCliente, setDataCliente] = useState(null);
  const [validCliente, setValidCliente] = useState(false);
  const [cantidadReferidos, setCantidadReferidos] = useState(0);
  const [cantidadPremios, setCantidadPremios] = useState(0);
  const restaurarDatos = () => {
    setTelefono('');
    setDataCliente(null);
    setValidCliente(false);
    findCodigo(id, token)
      .then(rta => {
        rta = rta.body;
        setCodigo(rta);
        setCantidadReferidos(rta.used.length)
        setCantidadPremios(rta.reward.length)
      })
      .catch(() => toast.error('No se pudo encontrar el codigo'))
  }

  useEffect(() => {
    findCodigo(id, token)
      .then(rta => {
        rta = rta.body;
        setCodigo(rta);
        setCantidadReferidos(rta.used.length)
        setCantidadPremios(rta.reward.length)
      })
      .catch(() => toast.error('No se pudo encontrar el codigo'))
  }, []);

  //cada vez que cambie el cliente
  useEffect(() => {
    if (!dataCliente) {
      setValidCliente(false);
    }
    setValidCliente(true);
  }, [dataCliente])

  const modificarIdCliente = async () => {
    try {
      toast.info('Enviando datos');
      //miramos si hay un cliente en dataCliente
      if (!validCliente) return toast.error('Asegúrate de tener el cliente')

      //ejecutamos la función asíncrona de modificar el codigo y le pasamos el id del cliente
      const rta = await updateCodigo({ clientId: dataCliente.id, id }, 'Referido', token);
      if (rta) {
        toast.success('Se modifico el dueño del codigo');
        restaurarDatos();
        return
      }
      throw 'No se pudo modificar el dueño del codigo'
    } catch (error) {
      toast.error('No se pudo modificar no se pudo modificar el dueño del codigo');
    }
  }


  //referidos
  const editarCantidadReferidos = async () => {
    try {
      toast.info('Enviando datos');
      const rta = await updateCodigo({ used: cantidadReferidos, id }, 'Referido', token);
      if (rta) {
        toast.success('Se modifico la cantidad de referidos');
        restaurarDatos();
        return
      }
      throw 'No se pudo modificar la cantidad de referidos'
    } catch (error) {
      toast.error('No se pudo modificar no se pudo modificar la cantidad de referidos');
    }
  }

  const disabledCantidadReferidos = () => { return false }


  //premios
  const disabledCantidadPremios = () => {
    const cantidadReferidosCodigo = codigo?.used?.length || 0
    if (cantidadPremios * 3 > cantidadReferidosCodigo) {
      return true;
    }
    return false;
  }
  const editarCantidadPremios = async () => {
    try {
      toast.info(`Enviando datos, ${cantidadPremios}`);
      const rta = await updateCodigo({ reward: cantidadPremios, id }, 'Referido', token);
      if (rta) {
        toast.success('Se modifico la cantidad de premios');
        restaurarDatos();
        return
      }
      throw 'No se pudo modificar la cantidad de premios'
    } catch (error) {
      toast.error('No se pudo modificar la cantidad de premios');
    }
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col xs={12} md={5}>
          <h1>Editar codigo</h1>
          <Card>
            <Card.Body>
              <Card.Title className="text-center display-4 mt-2 mb-3 text-nowrap overflow-hidden text-truncate">{id}</Card.Title>
              {/* texto explicativo de que se va a hacer */}
              <p>Edita los datos de codigo de referidos</p>
              <p>Por motivos de permisos solo puedes cambiar los datos básicos</p>
              <br />

              {/* Buscador de cliente */}
              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Editar cliente</Accordion.Header>
                  <Accordion.Body>

                    <BuscadorCliente
                      telefono={telefono}
                      setTelefono={setTelefono}
                      token={token}
                      dataCliente={dataCliente}
                      setDataCliente={setDataCliente}
                    />

                    <Row>
                      <Button
                        variant='success'
                        onClick={modificarIdCliente}
                        disabled={dataCliente ? false : true}
                      >
                        Modificar el dueño del codigo
                      </Button>
                    </Row>

                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>Editar Referidos</Accordion.Header>
                  <Accordion.Body>
                    {/* Boton para modificar los referidos */}
                    <Form.Group className="mb-3">
                      <InputCantidadNumber
                        cantidad={cantidadReferidos}
                        setCantidad={setCantidadReferidos}
                        textLabel='Cantidad de referidos'
                        buttonPrimary={
                          <Button
                            variant='success'
                            onClick={editarCantidadReferidos}
                            disabled={disabledCantidadReferidos()}
                          >
                            enviar
                          </Button>
                        }
                      />
                    </Form.Group>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Editar Premios</Accordion.Header>
                  <Accordion.Body>
                    <InputCantidadNumber
                      cantidad={cantidadPremios}
                      setCantidad={setCantidadPremios}
                      textLabel='Cantidad de premios'
                      buttonPrimary={
                        <Button
                          variant='success'
                          onClick={editarCantidadPremios}
                          disabled={disabledCantidadPremios()}
                        >
                          enviar
                        </Button>
                      }
                    />
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export { EditarCodigoReferido };
