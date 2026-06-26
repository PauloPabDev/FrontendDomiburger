import { useEffect, useState } from "react";
import { KitchenService } from "../../apis/clientV2/KitchenService";
import { useAuth } from "../../Context/AuthContext";
import { FormGroup, FormLabel, FormControl } from "react-bootstrap";

const SelectKitchen = ({ kitchenIdSelect, setKitchenIdSelect }) => {
  const [kitchens, setKitchens] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const { token } = useAuth();
  const kitchenService = new KitchenService(token);
  const fetchKitchens = async () => {
    setLoading(true);
    const response = await kitchenService.getAll();
    setKitchens(response.body || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  return (
    <FormGroup>
      <FormLabel htmlFor="selectKitchen">Seleccionar cocina</FormLabel>
      <FormControl
        as="select"
        name="selectKitchen"
        id="selectKitchen"
        value={kitchenIdSelect || ''}
        onChange={(e) => setKitchenIdSelect(e.target.value)}
      >
        <option value="">Automático</option>
        {isLoading && <option>Cargando...</option>}
        {!isLoading &&
          kitchens.map((kitchen) => (
            <option key={kitchen.id} value={kitchen.id}>
              {kitchen.name}
            </option>
          ))}
      </FormControl>
    </FormGroup>
  );
}

export { SelectKitchen };