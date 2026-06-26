 
import React, { useState, useEffect, useMemo } from "react";
import { Col } from "react-bootstrap";
import { listStatusRecepcion } from "../../Utils/listStatus";
import { useRecepcion } from "../../Context/RecepcionContex";
import { BsInbox } from "react-icons/bs";
import { FaExpand } from "react-icons/fa";
import { OrderCardV2 } from "../OrderCardV2";

export const ColsPedidos = ({ pedidos }) => {
  const { domiciliarioIdFilter } = useRecepcion();
  const [collapsedStates, setCollapsedStates] = useState([]);

  const filteredPedidos = useMemo(() => {
    if (domiciliarioIdFilter === "ninguno") {
      return pedidos.filter(pedido => !pedido?.assignedCourierUserId);
    } else if (domiciliarioIdFilter) {
      return pedidos.filter(pedido => pedido?.assignedCourierUserId === domiciliarioIdFilter);
    }
    return pedidos;
  }, [domiciliarioIdFilter, pedidos]);

  useEffect(() => {
    const initialStates = listStatusRecepcion.map((estado) => {
      const pedidosEnEstado = filteredPedidos.filter(
        pedido => pedido.status === estado.name
      );
      return pedidosEnEstado.length === 0;
    });
    setCollapsedStates(initialStates);
  }, [filteredPedidos]);

  const toggleCollapse = index => {
    setCollapsedStates(prev => prev.map((isCollapsed, i) => (i === index ? !isCollapsed : isCollapsed)));
  };


  const estadosPedidos = listStatusRecepcion.map(estado => {
    const icon = estado.icon
      ? React.cloneElement(estado.icon, { style: { color: estado.color } })
      : <BsInbox style={{ color: estado.color }} />;

    return {
      name: estado.label,
      pedidos: filteredPedidos.filter(pedido => pedido.status === estado.name),
      icon: icon
    };
  });

  return (
    <>
      {estadosPedidos.map((estado, index) => {
        const isCollapsed = collapsedStates[index];
        const pedidosCount = estado.pedidos.length;

        let badgeColor = "bg-secondary"; // Default color (sin pedidos)
        if (pedidosCount > 0) {
          badgeColor = isCollapsed ? "bg-warning" : "bg-success"; // Amarillo si está colapsada, verde si expandida
        }

        return (
          <Col
            key={index}
            className="d-flex flex-column align-items-center"
            style={{
              width: isCollapsed ? "10rem" : "30rem",
              transition: "all 0.3s ease",
              padding: "10px",
            }}
          >
            {/* Título */}
            <div
              className={`d-flex ${isCollapsed ? "flex-column text-center" : "justify-content-between"
              } align-items-center w-100`}
              style={{
                cursor: "pointer",
                borderBottom: "1px solid #ddd",
                padding: "10px 0",
              }}
              onClick={() => toggleCollapse(index)}
            >
              {/* Ícono */}
              <span
                style={{
                  fontSize: "1.5rem",
                  marginBottom: isCollapsed ? "5px" : "0",
                }}
              >
                {estado.icon}
              </span>

              {/* Nombre del estado */}
              {!isCollapsed && (
                <span
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {estado.name}
                </span>
              )}

              {/* Cantidad de pedidos */}
              <span
                className={`badge ${badgeColor}`}
                style={{
                  fontSize: "0.9rem",
                  marginTop: isCollapsed ? "5px" : "0",
                }}
              >
                {pedidosCount}
              </span>
            </div>

            {/* Contenido */}
            <div
              className="d-flex flex-column align-items-center"
              style={{
                height: isCollapsed ? "100px" : "auto",
                overflow: isCollapsed ? "hidden" : "auto",
                width: "100%", // Asegurar que el ancho sea 100%
              }}
            >
              {isCollapsed ? (
                <FaExpand
                  size={30}
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleCollapse(index)}
                />
              ) : (
                estado.pedidos.map((pedido) => (
                  <OrderCardV2 key={pedido.id} data={pedido} />
                ))
              )}
            </div>
          </Col>
        );
      })}
    </>
  );
};