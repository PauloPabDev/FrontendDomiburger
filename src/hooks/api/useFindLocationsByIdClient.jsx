import { useMemo, useState } from "react";
import { LocationsService } from "../../apis/clientV2/LocationsService";
import { useAuth } from "../../Context/AuthContext";

const useFindLocationsByIdClient = () => {

  const { token } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const locationsService = useMemo(() => new LocationsService(token), [token]);

  const findLocationsByIdClient = async (idClient) => {
    if (!idClient) {
      setLocations([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const rta = await locationsService.getByIdClient(idClient);
      setLocations(rta.body || []);
      return rta.body;
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { locations, loading, error, findLocationsByIdClient };

}

export { useFindLocationsByIdClient };