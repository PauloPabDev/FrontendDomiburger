// components/PaymentBreakdown.jsx
import { Row, Col } from "react-bootstrap";
import formatearNumeroConPuntos from "../../../Utils/formatearNumeroConPuntos";
import { useWorker } from "../../../Context/WorkerContext";

const PaymentBreakdown = ({ totalPrice, delivery, orderItems }) => {
  const { listProducts } = useWorker();

  // Enriquecer orderItems con datos de productos
  const enrichedItems = orderItems?.map((item) => {
    const product = listProducts.find((p) => p.id === item.id);
    const enrichedComplements = item.complements?.map((complement) => {
      const complementProduct = listProducts.find((p) => p.id === complement.id);
      return {
        ...complementProduct,
        ...complement,

      };
    }) || [];

    return {
      ...item,
      ...product,
      price: item.price ?? product?.price ?? 0,
      note: item.note || "",
      complements: enrichedComplements,
    };
  }) || [];

  return (
    <>
      <hr className="my-2" />
      <Row className="mb-2">
        <Col xs={6} className="text-secondary">Envío:</Col>
        <Col xs={6} className="text-end fw-semibold">
          {formatearNumeroConPuntos(delivery.price)}
        </Col>
      </Row>
      <hr className="my-2" />
      <Row className="mb-1">
        <Col xs={12} className="text-secondary">Productos:</Col>
      </Row>
      {enrichedItems.map((item, index) => (
        <div key={index} className="mb-1">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small text-truncate" style={{ maxWidth: "65%" }}>
              {item.quantity || 1}x {item.name}
            </span>
            <span className="small text-nowrap">
              {formatearNumeroConPuntos(item?.price || 0)}
            </span>
          </div>
          {item.complements?.map((complement, cIndex) => (
            <div key={cIndex} className="d-flex justify-content-between align-items-center ms-2">
              <span className="text-muted text-truncate" style={{ fontSize: "0.75rem", maxWidth: "60%" }}>
                + {complement.quantity || 1}x {complement.name}
              </span>
              <span className="text-nowrap" style={{ fontSize: "0.75rem" }}>
                {formatearNumeroConPuntos(complement.price || 0)}
              </span>
            </div>
          ))}
        </div>
      ))}
      <hr className="my-2" />
      <Row className="mb-2">
        <Col xs={6} className="text-secondary">Total:</Col>
        <Col xs={6} className="text-end fw-semibold text-success">
          {formatearNumeroConPuntos(totalPrice)}
        </Col>
      </Row>
    </>
  );
};

export default PaymentBreakdown;
