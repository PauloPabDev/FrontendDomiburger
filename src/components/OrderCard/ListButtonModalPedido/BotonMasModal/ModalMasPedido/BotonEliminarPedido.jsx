import { useContext, useState } from 'react';
import { Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { UtilsApi } from '../../../../../Utils/utilsApi';
import { MiContexto } from '../../../../../Context';

const BotonEliminarPedido = ({ idOrder, handleClose }) => {
  const [confirmar, setConfirmar] = useState(false);
  const { tokenLogin } = useContext(MiContexto);

  const handleConfirmar = async () => {
    try {
      const token = tokenLogin.token;
      const url = `estados/eliminados?idPedido=${idOrder}`;

      const response = await UtilsApi({ peticion: url, token, vervo: 'DELETE' });

      handleClose();
    } catch (error) {
    } finally {
      setConfirmar(false);
    }
  };

  const handleCancelar = () => setConfirmar(false);

  return (
    <div className="text-center">
      {confirmar ? (
        <Row className="justify-content-center">
          <Col xs="auto">
            <ButtonGroup>
              <Button variant="outline-success" onClick={handleConfirmar}>
                Confirmar
              </Button>
              <Button variant="outline-danger" onClick={handleCancelar}>
                Cancelar
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      ) : (
        <Button variant="warning" onClick={() => setConfirmar(true)}>
          Eliminar Pedido
        </Button>
      )}
    </div>
  );
};

export default BotonEliminarPedido;
