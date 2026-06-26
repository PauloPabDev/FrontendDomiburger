import { useContext, useEffect, useState } from 'react';
import { Modal, Button, Row } from 'react-bootstrap';
import { RecepcionContexto } from '../../../Context/RecepcionContex';
import Form from 'react-bootstrap/Form';
import { UtilsApi } from '../../../Utils/utilsApi';
import { useAuth } from '../../../Context/AuthContext';

const ModalAsignarPedido = ({ show, handleClose, nameDomiciliario, idPedido, data }) => {
  const contextRecepcion = useContext(RecepcionContexto)
  //el domiciliaro que selecion en el select
  const [domiciliarioSelect, setDomiciliarioSelect] = useState(null)
  //el estasdo del boton de los botones para hacer aparecer el boton de confirmar y cacelar 
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => {
    if (domiciliarioSelect == 'otros') {
      contextRecepcion.openCloseModalAgregarDo()
      //deberiamos de poner el select en la opcion por defecto 
    }
  }, [domiciliarioSelect])
  const { token } = useAuth()

  const handleConfirmar = () => {
    // Lógica para confirmar el pedido
    //si ya esta asignado un domiciliario se debe reasignar
    if (!domiciliarioSelect) return

    //asignamos al domiciliario
    let urlPeticion = `domiciliarios/asignacion/?idDomiciliario=${domiciliarioSelect}&idPedido=${idPedido}`

    if (!data?.domiciliario_asignado) urlPeticion = `domiciliarios/reasignacion?idDomiciliario=${domiciliarioSelect}&idPedido=${idPedido}`

    UtilsApi({ peticion: urlPeticion, token: token })
      .then(() => setConfirmar(false))
      .then(() => handleClose())//cerras el modal

  };

  const handleCancelar = () => {
    // Lógica para cancelar el pedido
    setConfirmar(false);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Asignar a un domiciliario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Domiciliario actual: <span>{nameDomiciliario}</span> </p>
        <p>{domiciliarioSelect}</p>
        <Row className='m-3'>
          <Form.Select
            name="domiciliario"
            onChange={(e) => (setDomiciliarioSelect(e.target.value))}
          >
            <option value='Selecionar'  >Selecionar domiciliario</option>

            {
              contextRecepcion.listDomiciliarios &&
              contextRecepcion.listDomiciliarios.map(domiciliario => (
                <option
                  key={domiciliario.id}
                  value={domiciliario.id}>
                  {domiciliario.name}
                </option>
              ))
            }
            <option value='otros'>Otros</option>
          </Form.Select>

        </Row>

        <Row className='m-3'>
          {confirmar ? (
            <div>
              <Button variant="outline-success" onClick={handleConfirmar}>Confirmar</Button>
              <Button variant="outline-danger" onClick={handleCancelar}>Cancelar</Button>
            </div>
          ) : (
            <Button variant='warning' onClick={() => setConfirmar(true)}>Asignar Domiciliario</Button>
          )}
        </Row>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal >
  );
};

export { ModalAsignarPedido };
