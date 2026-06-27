import { Badge, Button, Dropdown } from "react-bootstrap";
import { FaStore, FaMapMarkerAlt, FaExclamationTriangle, FaChevronDown } from "react-icons/fa";
import { LuChefHat } from "react-icons/lu";
import { useMiContexto } from "../../Context";
import { useWorker } from "../../Context/WorkerContext";
import { useAuth } from "../../Context/AuthContext";

const KitchenActiveBanner = () => {
  const { kitchenSelectId, changeKitchen } = useMiContexto();
  const { listKitchens } = useWorker();
  const { userData } = useAuth();

  const assignedIds = userData?.assignedKitchens || [];
  const assignedKitchens = listKitchens.filter((k) => assignedIds.includes(k.id));
  const currentKitchen = listKitchens.find((k) => k.id === kitchenSelectId);

  // Sin cocinas asignadas
  if (assignedIds.length === 0) {
    return (
      <div className="d-flex align-items-center gap-2 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 px-3 py-2 mb-3">
        <FaExclamationTriangle className="text-danger flex-shrink-0" />
        <span className="text-danger fw-semibold small">
          No tienes cocinas asignadas. Contacta al administrador.
        </span>
      </div>
    );
  }

  // Solo una cocina o ninguna asignada con nombre disponible
  if (assignedKitchens.length <= 1) {
    return (
      <div className="d-flex align-items-center gap-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 px-3 py-2 mb-3">
        <div className="bg-success bg-opacity-15 rounded-circle p-2 flex-shrink-0">
          <LuChefHat className="text-success" size={18} />
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-success">
              {currentKitchen?.name || "Cocina activa"}
            </span>
            <Badge bg="success" className="rounded-pill" style={{ fontSize: "0.7rem" }}>
              Activa
            </Badge>
          </div>
          {currentKitchen?.address && (
            <small className="text-muted text-truncate d-block">
              <FaMapMarkerAlt size={10} className="me-1" />
              {currentKitchen.address}
            </small>
          )}
        </div>
      </div>
    );
  }

  // Múltiples cocinas: dropdown para cambiar
  return (
    <div className="d-flex align-items-center gap-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 px-3 py-2 mb-3">
      <div className="bg-success bg-opacity-15 rounded-circle p-2 flex-shrink-0">
        <LuChefHat className="text-success" size={18} />
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-bold text-success">
            {currentKitchen?.name || "Sin cocina"}
          </span>
          <Badge bg="success" className="rounded-pill" style={{ fontSize: "0.7rem" }}>
            Activa
          </Badge>
        </div>
        {currentKitchen?.address && (
          <small className="text-muted text-truncate d-block">
            <FaMapMarkerAlt size={10} className="me-1" />
            {currentKitchen.address}
          </small>
        )}
      </div>
      <Dropdown>
        <Dropdown.Toggle
          as={Button}
          variant="outline-success"
          size="sm"
          className="d-flex align-items-center gap-1 rounded-pill"
        >
          <FaStore size={12} />
          <span className="d-none d-sm-inline">Cambiar</span>
          <FaChevronDown size={10} />
        </Dropdown.Toggle>
        <Dropdown.Menu align="end">
          <Dropdown.Header>Mis cocinas</Dropdown.Header>
          {assignedKitchens.map((kitchen) => (
            <Dropdown.Item
              key={kitchen.id}
              onClick={() => changeKitchen(kitchen.id)}
              active={kitchen.id === kitchenSelectId}
              className="d-flex align-items-center gap-2"
            >
              <LuChefHat size={14} />
              {kitchen.name}
              {kitchen.id === kitchenSelectId && (
                <Badge bg="success" className="ms-auto rounded-pill" style={{ fontSize: "0.65rem" }}>
                  Activa
                </Badge>
              )}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export { KitchenActiveBanner };
