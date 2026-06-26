import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import BuscadorCliente from '../../../components/Codigos/CrearCodigoReferido/BuscadorCliente';
import NameInput from '../../../components/FormsInputs/NameInput';
import CommentInput from '../../../components/FormsInputs/CommentInput';
import { Adiciones, Producto } from '../../../Utils/classProduct';
import RegisterSaleButton from '../../../components/RegisterSaleButton';
import PaymentMethodInput from '../../../components/FormsInputs/PaymentMethodInput';
import SelectDomiciliario from '../../../components/FormsInputs/SelectDomiciliario';
import InputCodigo from '../../../components/FormsInputs/InputCodigo';
import { toast } from 'react-toastify';
import postOrder from '../../../Utils/api/postOrder';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MapComponent from '../../../components/MapComponent/MapComponent';
import { useLoadScript } from '@react-google-maps/api';
import NoteClientInput from '../../../components/FormsInputs/NoteClientInput';
import DashboardProducts from '../../../components/Products/Dashboard/Dashboard';
import { calculateDeliveryDetails } from '../../../Utils/maps/calculateDeliveryDetails';
import { useAuth } from '../../../Context/AuthContext';
import { CENTER_ORIGIN } from '../../../Utils/const/locations';

const ENV = import.meta.env;

const libraries = ['places'];

 
const FormContainerAdmin = () => {
  const { token } = useAuth()

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: ENV.VITE_KEYMAPS,
    libraries,
  });

  const [coordinates, setCoordinates] = useState({});
  const [inputDataDireccion, setInputDataDireccion] = useState({
    address_complete: "",
    piso: "",
    valid: false,
  });
  // todos los dato que se envían al servidor
  const [dataCliente, setDataCliente] = useState(null);
  const [telefono, setTelefono] = useState('');
  const [name, setName] = useState('');
  const [clientNote, setNoteClient] = useState('');
  const [comment, setComment] = useState('');
  const [selectDomiciliario, setSelectDomiciliario] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Efectivo'); // El valor inicial debe coincidir con una de las opciones
  const [dataCode, setDataCode] = useState(null);

  const [isLoading, setLoading] = useState(false);
  const [precioDeliveryManual, setPrecioDeliveryManual] = useState(null);

  //cada vez que cambie el dato del cliente (cuando lo busquemos)
  useEffect(() => {
    const { name, address, phone, clientNote } = dataCliente || {};

    // Lógica condicional agrupada por tipo de dato
    if (name) {
      setName(name);
    }

    if (clientNote !== '') {
      setNoteClient(clientNote)
    }

    if (address) {
      const { address_complete, coordinates } = address;

      setCoordinates(coordinates);
      setInputDataDireccion({
        ...inputDataDireccion,
        address_complete,
        valid: true,
        type: 'autocompleted',
      });
    }

    if (phone) {
      setTelefono(phone);
    }
  }, [dataCliente]);

  const [listaProductosOrder, setListaProductosOrder] = useState([]);
  const [dataDomicilio, setDataDomicilio] = useState({});

  const [, setPrevCoordinates] = useState(null);

  //para calcular las distancia y el costo del domicilio
  useEffect(() => {
    if (!isLoaded) return
    //la logica para calcular el tiempo y el precio del domicilio segun las coordenadas y la direccion
    //miramos si es valido el input de la direccion

    if (!inputDataDireccion.valid) return

    // miramos si hay coordenadas
    if (!coordinates) return

    setPrevCoordinates(coordinates)
    calculateDeliveryDetails(CENTER_ORIGIN, coordinates)
      .then((data) => {
        setDataDomicilio(data);
        toast.success(`Domicilio calculado con éxito: ${data.timeText} y un costo de $${data.price}`);
      })
      .catch((error) => {
        toast.error(`No se pudo calcular el precio del domicilio ${error}`);
      })

  }, [inputDataDireccion])

  const sendOrder = async () => {
    let dataOrder = {}
    dataOrder.phone = telefono
    dataOrder.name = name
    dataOrder.address = {
      address_complete: inputDataDireccion.address_complete,
      coordinates: coordinates
    }
    dataOrder.fee = paymentMethod
    comment ? dataOrder.note = comment : null
    dataOrder.order = listaProductosOrder.map(e => {
      return {
        id: e.id,
        price: e.price,
        modifique: e?.modifique?.map(e => { return { id: e.id, code: e?.code } }),
        note: e.note,
        code: e.code
      }
    })


    precioDeliveryManual >= 0 ? dataOrder.addressPrice = precioDeliveryManual : null
    if (!dataDomicilio.price) delete dataOrder.addressPrice
    //si dataOrder.addressPrice no es de tipo number lo eliminamos
    if (typeof dataOrder.addressPrice !== 'number') delete dataOrder.addressPrice

    selectDomiciliario ? dataOrder.domiciliario_asignado = { id: selectDomiciliario } : null

    //miramos si la nota del cliente cambio
    if ((typeof clientNote === 'string') &&
      !(dataCliente?.clientNote === undefined && clientNote === '') &&
      dataCliente?.clientNote !== clientNote) {
      dataOrder.clientNote = clientNote
    }

    try {
      setLoading(true);
      const rta = await postOrder(dataOrder, token, true)
      const { priceTotal } = rta

      toast.success(`Pedido Creado con un precio de ${priceTotal.COP}`)
      setListaProductosOrder([])
      setDataCliente(null)
      setTelefono('')
      setName('')
      setNoteClient('')
      setComment('')
      setPaymentMethod('Efectivo')
      setSelectDomiciliario('')
      setDataCode(null)
      setCoordinates({})
      setPrecioDeliveryManual(null)
      setDataDomicilio({})
      setInputDataDireccion({
        address_complete: "",
        piso: "",
        valid: false,
      });

    } catch (error) {
      toast.error('Error al crear el pedido')
      toast.error(error)
    }
    setLoading(false);

  }

  const agregarCodigo = (dataCode) => {
    const codigoYaExiste = (lista, dataCode) => {
      const existe = lista.find(e => {
        const enModifique = e?.modifique?.find(m => m.code == dataCode.id);
        return e?.code == dataCode.id || enModifique;
      });
      if (existe) {
        toast.error('Ya tienes este código en tu pedido');
        return true;
      }
      return false;
    };

    if (dataCode.type !== 'Referido') {
      toast.error('no tenemos soporte para este tipo de codigo :(');
      return;
    }

    const lista = [...listaProductosOrder];

    if (dataCode?.clientId == dataCliente?.id) {
      const productReward = new Producto(dataCode.productsReward[0]);
      if (codigoYaExiste(lista, dataCode)) return;
      setListaProductosOrder([...lista, productReward]);
      return;
    }

    const listaInvertida = lista.reverse();
    const indexProducto = listaInvertida.findIndex(e => e.type == 'product');
    if (indexProducto === -1) {
      toast.error('no se encontró ningún producto para agregar el codigo');
      return;
    }
    if (codigoYaExiste(listaInvertida, dataCode)) return;

    const adicion = new Adiciones(dataCode.products[0]);
    listaInvertida[indexProducto].modifique.push(adicion);
    setListaProductosOrder(listaInvertida.reverse());
  }

  const retirarCodigo = (_dataCode) => {}

  return (
    <Container>
      {/* Aquí va el contenido del formulario */}
      <LoadingSpinner isLoading={isLoading} />
      <BuscadorCliente
        telefono={telefono}
        setTelefono={setTelefono}
        dataCliente={dataCliente}
        setDataCliente={setDataCliente}
        token={token}
        visibleDataClient={true}
      />

      <NameInput
        name={name}
        setName={setName}
      />

      {/* nota del cliente */}
      <NoteClientInput
        note={clientNote}
        setNote={setNoteClient}
      />
      {/* solo si isLoaded esta en true */}
      {isLoaded &&
        <MapComponent
          center={CENTER_ORIGIN}
          stateCoordenadas={[coordinates, setCoordinates]}
          stateDireccion={[inputDataDireccion, setInputDataDireccion]}
          errors={[null, null]}
        />
      }

      <InputCodigo
        client={[dataCliente, setDataCliente]}
        dataCode={dataCode}
        setDataCode={setDataCode}
        agregarCodigo={agregarCodigo}
        retirarCodigo={retirarCodigo}
      />

      <CommentInput
        comment={comment}
        setComment={setComment}
      />

      <SelectDomiciliario
        selectDomiciliario={selectDomiciliario}
        setSelectDomiciliario={setSelectDomiciliario}
      />

      <PaymentMethodInput
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />

      <DashboardProducts
        listaProductosOrder={listaProductosOrder}
        setListaProductosOrder={setListaProductosOrder}
        dataDomicilio={dataDomicilio}
        setDataDomicilio={setDataDomicilio}
        precioDeliveryManual={precioDeliveryManual}
        setPrecioDeliveryManual={setPrecioDeliveryManual}
        isAdmin={true}
      />
      <RegisterSaleButton
        onClick={() => sendOrder()}
      />

      {/* un espacio de separación */}
      <hr />

    </Container>
  )
}

export default FormContainerAdmin;
