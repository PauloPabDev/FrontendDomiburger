import { Button } from 'react-bootstrap';
import InputCodigoText from '../../Codigos/CrearCodigoReferido/InputCodigoText';
import { useState } from 'react';
import { findCodigo } from '../../../Utils/api/codigos/findCodigo';
import { toast } from 'react-toastify';
import CodeCard from '../../Codigos/CodeCard';
import { useAuth } from '../../../Context/AuthContext';

const InputCodigo = ({ client, dataCode, setDataCode, agregarCodigo, retirarCodigo }) => {
  const { token } = useAuth()

  const [code, setCode] = useState('');
  const [dataClient] = client

  // const agregarCodigo = () => {
  //   toast.success('...Simulando Codigo agregado');
  //   agregarCodigo
  // }

  const buscarCodigo = () => {
    findCodigo(code, token)
      .then((res) => {
        toast.success('Codigo encontrado');
        setDataCode(res.body)
        setCode('')
      })
      .catch((err) => {
        toast.error(err?.body);
      });
  }

  const ButtonActionCode = () => {
    if (dataCode) {
      //boton para eliminar el codigo
      return (<Button variant="danger" onClick={eliminarCodigo}>Eliminar</Button>)
    }
    return (<Button variant="primary" onClick={buscarCodigo}>Buscar</Button>)
  }
  const eliminarCodigo = () => {
    //si llegarmos a tener una lista de codigos se eliminaria de la lista
    setDataCode(null)
  }
  const eliminarProducto = (code) => {
    retirarCodigo(code)
  }
  return (
    <>
      <InputCodigoText
        codigo={code}
        setCodigo={setCode}
        ButtonComponent={code.length ? <ButtonActionCode /> : null}
      />
      {/* mostramos los datos de codigo  */}
      {/* {dataCode && <AlertInfoRedCodigo dataCodigo={dataCode} />} */}
      {dataCode &&
        <CodeCard
          deleteCode={eliminarCodigo}
          addProducts={agregarCodigo}
          deleteProducts={eliminarProducto}
          code={dataCode}
          client={dataClient}
        />}
    </>
  );
};

export default InputCodigo;
