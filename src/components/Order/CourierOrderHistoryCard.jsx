import { useState, useEffect } from "react";
import { Card, Badge, Collapse, Image, Spinner } from "react-bootstrap";
import {
  FaMotorcycle,
  FaMoneyBillWave,
  FaRoute,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaUser,
  FaShoppingBag,
} from "react-icons/fa";
import { statusOrderCol } from "../../Utils/listStatus";
import { useClientFindById } from "../../hooks/api/clients/useClientFindById";
import { useUserFindById } from "../../hooks/api/users/useUserFindById";
import { ResumedItems } from "../common/products/ResumedItems";
import { useWorker } from "../../Context/WorkerContext";
import { convertToTimestamp } from "../../Utils/formatTime";
import photoGeneric from "../../assets/img/photoGeneric.jpg";

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

const CourierOrderHistoryCard = ({ order }) => {
  const [open, setOpen] = useState(false);

  const { listProducts } = useWorker();
  const { data: clientData, fetchClient, loading: loadingClient } = useClientFindById();
  const { data: userData, fetchUser, loading: loadingUser } = useUserFindById();

  useEffect(() => {
    if (order.clientId) fetchClient(order.clientId);
    if (order.userId) fetchUser(order.userId);
  }, [order.clientId, order.userId]);

  const person = (order.userId ? userData : clientData) || userData || clientData;
  const loadingPerson = loadingClient || loadingUser;

  const colorStatus = statusOrderCol[order?.status]?.color || "#6c757d";
  const statusLabel = statusOrderCol[order?.status]?.label || order?.status;

  const { component: resumedItems } = ResumedItems(order?.orderItems, listProducts);

  const createdAt = convertToTimestamp(order.createdAt);

  const deliveryPrice = order.delivery?.price;
  const deliveryDistance = order.delivery?.distance;

  return (
    <Card className="border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
      {/* Barra de color según estado */}
      <div style={{ height: "5px", backgroundColor: colorStatus }} />

      <Card.Body className="p-3">
        {/* Fila: número de orden + hora + estado */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <span className="fw-bold fs-6 text-primary">
              <FaShoppingBag size={12} className="me-1" />
              #{order.dailyOrderNumber}
            </span>
            <div className="text-muted" style={{ fontSize: "0.78rem" }}>
              <FaClock size={10} className="me-1" />
              {new Date(createdAt).toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              &middot;{" "}
              {new Date(createdAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}
            </div>
          </div>
          <Badge
            bg=""
            style={{ backgroundColor: colorStatus }}
            className="rounded-pill text-white"
          >
            {statusLabel}
          </Badge>
        </div>

        {/* Cliente */}
        <div className="d-flex align-items-center mb-3 gap-2">
          {loadingPerson ? (
            <Spinner animation="border" size="sm" />
          ) : person ? (
            <>
              <Image
                src={person.photoUrl || photoGeneric}
                roundedCircle
                width={36}
                height={36}
                style={{ objectFit: "cover", flexShrink: 0 }}
              />
              <div>
                <div className="fw-medium lh-1">{person.name || "Sin nombre"}</div>
                {person.phone && (
                  <small className="text-muted">{person.phone}</small>
                )}
              </div>
            </>
          ) : (
            <span className="text-muted small">
              <FaUser className="me-1" />
              Cliente no disponible
            </span>
          )}
        </div>

        {/* Productos */}
        {order.orderItems?.length > 0 && (
          <div className="mb-3 d-flex flex-wrap gap-1">{resumedItems}</div>
        )}

        {/* Métricas clave */}
        <div className="d-flex justify-content-between align-items-end">
          {/* Columna izquierda: domicilio y distancia */}
          <div className="d-flex gap-3">
            {deliveryPrice !== undefined && (
              <div className="text-center">
                <div
                  className="fw-bold text-success"
                  style={{ fontSize: "0.95rem" }}
                >
                  <FaMoneyBillWave size={12} className="me-1" />
                  {formatCOP(deliveryPrice)}
                </div>
                <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                  Domicilio
                </div>
              </div>
            )}
            {deliveryDistance !== undefined && (
              <div className="text-center">
                <div
                  className="fw-bold text-info"
                  style={{ fontSize: "0.95rem" }}
                >
                  <FaRoute size={12} className="me-1" />
                  {(deliveryDistance / 1000).toFixed(1)} km
                </div>
                <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                  Recorrido
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha: total + método de pago */}
          <div className="text-end">
            <div className="fw-bold">{formatCOP(order.totalPrice)}</div>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
              {order.paymentMethod || "Sin método"}
            </div>
          </div>
        </div>

        {/* Pie: estado de pago + toggle detalles */}
        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
          <Badge
            bg={order.payment?.status === "approved" ? "success" : "secondary"}
            className="rounded-pill"
          >
            <FaMotorcycle size={10} className="me-1" />
            Pago: {order.payment?.status || "pendiente"}
          </Badge>
          {order.comment && (
            <button
              className="btn btn-link btn-sm text-muted p-0 d-flex align-items-center gap-1"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              <span style={{ fontSize: "0.8rem" }}>
                {open ? "Ocultar" : "Detalles"}
              </span>
            </button>
          )}
        </div>
      </Card.Body>

      {/* Detalles colapsables */}
      {order.comment && (
        <Collapse in={open}>
          <div>
            <Card.Body className="pt-0 px-3 pb-3 border-top bg-light rounded-bottom-4">
              <p className="small text-muted mb-0">
                <strong>Comentario:</strong> {order.comment}
              </p>
            </Card.Body>
          </div>
        </Collapse>
      )}
    </Card>
  );
};

export { CourierOrderHistoryCard };
