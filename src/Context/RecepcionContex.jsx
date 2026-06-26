/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { UsersService } from '../apis/clientV2/usersService';
import { toast } from 'react-toastify';
import { ROLES } from '../Utils/const/roles';
import { ProductsService } from '../apis/clientV2/ProductsService';

export const RecepcionContexto = createContext()


export const ContextProviderRecepcion = ({ children }) => {
  const [listDomiciliarios, setListDomiciliarios] = useLocalStorage('listDomiciliarios1', [])
  const [users, setUsers] = useLocalStorage('Domiciliarios1', []);
  const [domiciliariosSeleccionados, setDomiciliariosSeleccionados] = useState([])
  const [listProducts, setListProducts] = useState([])
  const { token } = useAuth()

  const userService = useMemo(() => new UsersService(token), [token]);
  const productosService = useMemo(() => new ProductsService(token), [token]);

  const findUser = useCallback(async () => {
    try {
      const usersData = await userService.getByRole(ROLES.COURIER.value);
      const listDomiciliariosFilter = listDomiciliarios.filter(e => usersData.body.find(u => u.id === e.id))
      setListDomiciliarios(listDomiciliariosFilter)
      setUsers(usersData.body);
    } catch (error) {
      toast.error(`Error al cargar los domiciliarios ${error?.response?.data?.message}`);
    }
  }, [userService, listDomiciliarios, setListDomiciliarios, setUsers]);

  const findsProducts = useCallback(async () => {
    try {
      const products = await productosService.getAll();
      setListProducts(products.body);
    } catch (error) {
      toast.error(`Error al cargar los productos ${error?.response?.data?.message}`);
    }
  }, [productosService]);

  useEffect(() => {
    findUser();
    findsProducts();
  }, [])

  //el modal para agrega los domiciliarios
  const [showModalAgregarDomiciliarios, setShowModalAgregarDomiciliarios] = useState(false);
  const openCloseModalAgregarDo = () => setShowModalAgregarDomiciliarios(!showModalAgregarDomiciliarios);


  //el filtro para buscar los domiciliarios
  const [domiciliarioIdFilter, setDomiciliarioIdFilter] = useState(null)

  const [openSidebarFilterDelivery, setOpenSidebarFilterDelivery] = useLocalStorage('openSidebarFilterDelivery', false)
  //setOpenSidebarFilterDelivery)
  const toggleSidebar = () => {
    if (domiciliarioIdFilter) {
      toast.error("No puedes cerrar el filtro, primero debes quitar el filtro del domiciliario");
      return
    }
    setOpenSidebarFilterDelivery((prevState) => !prevState);
  };

  return (
    <RecepcionContexto.Provider value={
      {
        listDomiciliarios, setListDomiciliarios,

        users, setUsers,

        listProducts,

        openCloseModalAgregarDo, showModalAgregarDomiciliarios,

        domiciliariosSeleccionados, setDomiciliariosSeleccionados,

        domiciliarioIdFilter, setDomiciliarioIdFilter,

        openSidebarFilterDelivery, toggleSidebar
      }
    }>
      {children}
    </RecepcionContexto.Provider>
  )
}

export const useRecepcion = () => { return useContext(RecepcionContexto) }
