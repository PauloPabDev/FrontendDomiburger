import { useState, useEffect } from 'react';
import { ProductsService } from '../../apis/clientV2/ProductsService';
import { toast } from 'react-toastify';
import { useAuth } from '../../Context/AuthContext';

const useAdiciones = () => {
  const [adiciones, setAdiciones] = useState([]);
  const token = useAuth();
  const productsService = new ProductsService(token);

  useEffect(() => {
    const fetchAdiciones = async () => {
      try {
        const response = await productsService.getAll();
        let data = response.body;
        // Filtramos solo las adiciones
        data = data.filter(e => e.type === 'complement');
        setAdiciones(data);
      } catch (error) {
        toast.error('Error obteniendo las adiciones.');
      }
    };

    fetchAdiciones();
  }, []);

  return adiciones;
};

export default useAdiciones;
