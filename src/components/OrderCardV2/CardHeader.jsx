import { memo, useEffect, useState, useCallback } from "react";
import { Card, Badge, Image, Spinner, OverlayTrigger, Popover } from "react-bootstrap";
import photoGeneric from "../../assets/img/photoGeneric.jpg";
import { DetailsModalOrder } from "./DetailsModalOrder/index";
import { useWorker } from "../../Context/WorkerContext";
import { useCache } from "../../Context/CacheContext";
import { ORIGINS } from "../../Utils/const/order/origins";
import { convertToTimestamp } from "../../Utils/formatTime";

const CardHeaderComponent = memo(({ order }) => {
  const { listKitchens } = useWorker();
  const { getUserById, getClientById } = useCache();
  const kitchen = listKitchens.find(kitchen => kitchen.id === order?.assignedKitchenId);

  const { userId, dailyOrderNumber, clientId } = order;
  const [userClient, setUserClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const user = userId
        ? await getUserById(userId)
        : clientId
          ? await getClientById(clientId)
          : null;
      setUserClient(user);
    } catch (error) {
    }
    setLoading(false);
  }, [userId, clientId, getUserById, getClientById]);

  useEffect(() => {
    if (userId || clientId) fetchUser();
  }, [userId, clientId, fetchUser]);

  const userName = userClient?.name || "Sin nombre";
  const profilePicture = userClient?.photoUrl || photoGeneric;
  const orderNumber = dailyOrderNumber || "#";

  const colorHeaderByOrder = (order) => {
    if (order?.origin === ORIGINS.PUBLIC) return "warning"
    return userId ? "primary" : clientId ? "success" : "secondary";
  }
  const headerVariant = colorHeaderByOrder(order)

  const popover = (
    <Popover id="popover-profile">
      <Popover.Header as="h3">{userName}</Popover.Header>
      <Popover.Body>
        <strong>Información del usuario:</strong>
        <p>Email: {userClient?.email || "No disponible"}</p>
        <p>Teléfono: {userClient?.phone || "No disponible"}</p>
        <div className="d-flex justify-content-between">
          <a href={`tel:${userClient?.phone}`} className="btn btn-primary btn-sm">
            Llamar
          </a>
          <a href={`/user/${userClient?.id}`} className="btn btn-secondary btn-sm">
            Ver más detalles
          </a>
        </div>
      </Popover.Body>
    </Popover>
  );

  const createdAt = convertToTimestamp(order?.createdAt);

  return (
    <>
      <Card.Header className={`bg-${headerVariant} text-white`}>
        <div className="d-flex flex-column gap-2">

          {/* Cocina y hora */}
          <div className="d-flex justify-content-between">
            <span className="text-white small">
              {new Date(createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="badge ">{kitchen?.name || 'Sin cocina'}</span>

          </div>

          {/* Cliente y acciones */}
          <div className="d-flex justify-content-between align-items-center">
            <Badge
              bg="light"
              text="dark"
              onClick={() => setShowModal(true)}
              className="rounded-pill"
              style={{ fontSize: "1rem", padding: "0.5rem 0.7rem", cursor: "pointer" }}
            >
              <small>{orderNumber}</small>
            </Badge>

            <h5 className="mb-0">{loading ? <Spinner animation="border" size="sm" /> : userName}</h5>

            <div className="d-flex align-items-center">
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <OverlayTrigger trigger="click" placement="auto" overlay={popover}>
                  <Image
                    src={profilePicture}
                    alt="Foto de perfil"
                    className="rounded-circle"
                    width="40"
                    height="40"
                    style={{ cursor: "pointer" }}
                  />
                </OverlayTrigger>
              )}
            </div>
          </div>
        </div>
      </Card.Header>


      <DetailsModalOrder showModal={showModal} setShowModal={setShowModal} order={order} />

    </>
  );
});

// 🔥 SOLUCIÓN: Agregar displayName manualmente
CardHeaderComponent.displayName = "CardHeaderComponent";

export default CardHeaderComponent;
