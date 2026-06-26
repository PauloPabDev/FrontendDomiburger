import { useMemo, useState } from "react";
import { LocationsService } from "../../../apis/clientV2/LocationsService";
import { useAuth } from "../../../Context/AuthContext";

const useDeleteLocation = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const locationService = useMemo(() => new LocationsService(token), [token]);

  const deleteLocation = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const rta = await locationService.delete(id);
      setData(rta);
      return rta;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { deleteLocation, loading, error, data };
};

export { useDeleteLocation };
