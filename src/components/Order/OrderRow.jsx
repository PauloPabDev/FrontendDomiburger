import { useState, useEffect } from "react";
import { Badge, Button } from "react-bootstrap";
import { RECEPCION_ROUTES } from "../../Utils/const/namesRutes";
import { statusOrderCol } from "../../Utils/listStatus";
import { useClientFindById } from "../../hooks/api/clients/useClientFindById";
import { useUserFindById } from "../../hooks/api/users/useUserFindById";
import { NameAndPhoto } from "../common/users/NameAndPhoto";
import { useWorker } from "../../Context/WorkerContext";
import { ResumedItems } from "../common/products/ResumedItems";
import { ProductsTable } from "../OrderCardV2/ProductsTable";
import { convertToTimestamp } from "../../Utils/formatTime";

const OrderRow = ({ order }) => {
  const [open, setOpen] = useState(false);
  const colorStatus = statusOrderCol[order?.status]?.color || "#000000";

  const [isUser, setIsUser] = useState(false);
  // Consultamos el cliente y el repartidor
  const { data: clientData, fetchClient } = useClientFindById();
  const { data: userData, fetchUser } = useUserFindById();
  const { data: courierData, fetchUser: fetchCourier } = useUserFindById();
  useEffect(() => {
    // Evitar llamadas innecesarias si no hay IDs
    if (order.clientId) fetchClient(order.clientId);
    if (order.userId) {
      fetchUser(order.userId);
      setIsUser(true);
    }
    if (order.assignedCourierUserId) fetchCourier(order.assignedCourierUserId);
  }, [order.clientId, order.assignedCourierUserId]);

  // Resumimos los productos usando el hook correspondiente
  const { listProducts } = useWorker();
  const { component: resumedItems, hasComplements } = ResumedItems(order?.orderItems, listProducts);

  const createdAt = convertToTimestamp(order.createdAt);



  return (
    <>
      {/* Fila principal de la orden */}
      <tr>
        <td>#{order.dailyOrderNumber}</td>
        <td>
          {new Date(createdAt).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" -- "}
          {new Date(createdAt).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}

        </td>
        <td>
          <Badge
            bg=""
            style={{
              backgroundColor: colorStatus,
              color: "white",
              fontSize: "0.85rem",
              padding: "5px 10px",
            }}
          >
            {statusOrderCol[order?.status].label}
          </Badge>
        </td>
        <td>
          {isUser && userData ? (
            <NameAndPhoto name={userData.name} photo={userData.photoUrl} client={userData} />
          ) : (
            clientData && <NameAndPhoto name={clientData.name} photo={clientData.photoUrl} client={clientData} />
          )}
        </td>
        <td>
          {courierData && (
            <NameAndPhoto name={courierData.name} photo={courierData.photoUrl} client={courierData} />
          )}
        </td>
        <td>
          {resumedItems} {hasComplements && <Badge bg="danger">!!!</Badge>}
        </td>
        <td>
          <strong>${order.totalPrice.toLocaleString()}</strong>
        </td>
        <td>{order.paymentMethod}</td>
        <td>
          <Badge bg={order.payment?.status === "approved" ? "primary" : "secondary"}>
            {order.payment?.status || "N/A"}
          </Badge>
        </td>
        <td>
          <Button variant="link" onClick={() => setOpen(!open)}>
            {open ? "Ocultar" : "Detalles"}
          </Button>
          <a
            href={`${RECEPCION_ROUTES.routes.PEDIDOS_DETAIL}/${order.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Ver Detalles
          </a>
        </td>
      </tr>

      {/* Fila de detalle, visible al hacer clic en "Detalles" */}
      {open && (
        <tr>
          <td colSpan="10">
            <Details order={order} client={clientData} delivery={order.delivery} user={userData} />
          </td>
        </tr>
      )}
    </>
  );
};

const Details = ({ order }) => {
  const { listProducts } = useWorker();
  const { component: products } = ResumedItems(order?.orderItems, listProducts);

  return (
    <div className="p-2">
      {/* Productos */}
      <ProductsTable orderItems={products} />
    </div>
  )
}

export { OrderRow };
