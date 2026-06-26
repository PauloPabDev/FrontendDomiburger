import { useEffect, useState } from "react";
import ReusableModal from "../common/ReusableModal";
import { KitchenService } from "../../apis/clientV2/KitchenService";
import { useAuth } from "../../Context/AuthContext";

const EditAssignedKitchensModal = ({ show, handleClose, assignedKitchens, onSave, isLoading }) => {
  const { token } = useAuth();
  const kitchienService = new KitchenService(token);

  const [selectedAssignedKitchens, setSelectedAssignedKitchens] = useState(assignedKitchens || []);
  const [listKitchens, setListKitchens] = useState([])

  useEffect(() => {
    const findKitchens = async () => {
      const kitchens = await kitchienService.getAll();
      setListKitchens(kitchens.body);
    }
    findKitchens();
  }, [token]);

  const handleChage = (idKitchen) => {
    setSelectedAssignedKitchens((prev) => {
      if (prev.includes(idKitchen)) {
        return prev.filter((k) => k !== idKitchen);
      }
      return [...prev, idKitchen];
    });
  }

  return (
    <ReusableModal show={show} handleClose={handleClose} title="Editar Roles">
      <div className="p-3">
        <p className="mb-3">Selecciona las cocinas para asignar:</p>


        {listKitchens.map((kitchen) => (
          <div className="form-check" key={kitchen.id}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`kitchen-${kitchen.id}`}
              // value={kitchen.id}
              checked={selectedAssignedKitchens.includes(kitchen.id)}
              onChange={() => handleChage(kitchen.id)}
            />
            <label className="form-check-label" htmlFor={`kitchen-${kitchen.id}`}>
              {kitchen.name}
            </label>
          </div>
        ))}


      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={handleClose} disabled={isLoading}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={() => onSave(selectedAssignedKitchens)} disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...
            </>
          ) : (
            "Guardar"
          )}
        </button>
      </div>
    </ReusableModal>
  );
};

export { EditAssignedKitchensModal };
