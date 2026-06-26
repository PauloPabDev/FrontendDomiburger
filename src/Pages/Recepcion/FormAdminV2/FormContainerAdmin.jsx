import { useEffect, useMemo, useState } from 'react';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';

import LoadingSpinner from '../../../components/LoadingSpinner';
import { ClientSearchModule } from '../../../components/Client/ClientSearchModule';
import { ViewListLocations } from './ViewListLocations';
import CommentInput from '../../../components/FormsInputs/CommentInput';
import SelectDomiciliario from '../../../components/FormsInputs/SelectDomiciliario';
import { SelectKitchen } from '../../../components/FormsInputs/SelectKitchen';
import DashboardProducts from '../../../components/Products/Dashboard/Dashboard';
import RegisterSaleButton from '../../../components/RegisterSaleButton';
import { KitchenAndDeliveryInfo } from '../../../components/FormsInputs/KitchenAndDeliveryInfo';

import { OrderService } from '../../../apis/clientV2/OrderService';
import { useAuth } from '../../../Context/AuthContext';
import { TotalPrice } from '../../../components/TotalPrice';
import { usePaymentMethodCom } from './usePaymentMethodCom';

const FormContainerAdmin = () => {
  const { token } = useAuth();

  // Estados
  const [dataClient, setDataClient] = useState(null);
  const [selectDomiciliario, setSelectDomiciliario] = useState('');
  const { Component: PaymentMethodInput, paymentMethod, setPaymentValueDefault } = usePaymentMethodCom();
  const [isLoading, setIsLoading] = useState(false);
  const [locationIdSelect, setLocationIdSelect] = useState(null);
  const [comment, setComment] = useState('');
  const [kitchenIdSelect, setKitchenIdSelect] = useState('');
  const [productOrderList, setProductOrderList] = useState([]);
  const [delivery, setDelivery] = useState(null);
  const [kitchen, setKitchen] = useState(null);

  const ordersService = useMemo(() => new OrderService(token), [token]);

  // Función para enviar la orden
  const sendOrder = async () => {
    if (!dataClient) {
      toast.error("Por favor, seleccione un cliente.");
      return;
    }
    if (!locationIdSelect) {
      toast.error("Por favor, seleccione una dirección.");
      return;
    }
    if (productOrderList.length === 0) {
      toast.error("Agregue al menos un producto a la orden.");
      return;
    }

    const orderItems = productOrderList.map(product => {

      const r = { id: product.id }
      if (product?.modifique && product?.modifique.length > 0) r.complements = product?.modifique.map(complement => ({ id: complement.id }))
      //if(product.quantity) r.quantity = product.quantity
      return r;
    })
    // Se arma el objeto con la información necesaria para el pedido
    const orderData = {
      clientId: dataClient.id,
      locationId: locationIdSelect,
      comment,
      paymentMethod,
      orderItems: orderItems,
      delivery,
    };

    // Si se ha seleccionado un domiciliario y cocina, se agrega la información
    if (kitchenIdSelect) {
      orderData.assignedKitchenId = kitchenIdSelect;
    }

    setIsLoading(true);
    try {
      await ordersService.createPublicAdmin(orderData);
      toast.success("Pedido creado con éxito.");
      // Opcional: Resetear estados o limpiar formulario aquí
      //ponemos los estados en su estado original
      setDataClient(null);

      setSelectDomiciliario('');
      setPaymentValueDefault()
      setLocationIdSelect(null);
      setComment('');
      setKitchenIdSelect('');
      setProductOrderList([]);
      setDelivery(null);
      setKitchen(null);


    } catch (error) {
      toast.error("Error al crear el pedido");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!dataClient) {
      setLocationIdSelect(null);
      setDelivery(null);
    }
  }, [dataClient]);
  useEffect(() => {
    if (!locationIdSelect) {
      setDelivery(null);
    }
  }, [locationIdSelect]);


  return (
    <Container>
      <LoadingSpinner isLoading={isLoading} />

      <ClientSearchModule setDataClient={setDataClient} dataClient={dataClient} />

      <ViewListLocations
        locationIdSelect={locationIdSelect}
        setLocationIdSelect={setLocationIdSelect}
        clientId={dataClient?.id}
        dataClient={dataClient}
        userId={null}
      />

      <CommentInput comment={comment} setComment={setComment} />

      <PaymentMethodInput />
      <SelectDomiciliario
        selectDomiciliario={selectDomiciliario}
        setSelectDomiciliario={setSelectDomiciliario}
      />

      <SelectKitchen kitchenIdSelect={kitchenIdSelect} setKitchenIdSelect={setKitchenIdSelect} />
      <KitchenAndDeliveryInfo
        kitchen={kitchen}
        setKitchen={setKitchen}
        delivery={delivery}
        setDelivery={setDelivery}
        locationIdSelect={locationIdSelect}
        kitchenIdSelect={kitchenIdSelect}
      />
      <DashboardProducts
        listaProductosOrder={productOrderList}
        setListaProductosOrder={setProductOrderList}
        delivery={delivery}
      />

      {/* total */}
      <TotalPrice
        productOrderList={productOrderList}
        delivery={delivery}
      />
      <RegisterSaleButton onClick={sendOrder} />

      <hr />
    </Container>
  );
};


export default FormContainerAdmin;
