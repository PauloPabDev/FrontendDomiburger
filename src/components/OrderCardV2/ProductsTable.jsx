import { Table, Badge } from "react-bootstrap";
import "./ProductsTable.css";
import { ItemProductBadge } from "../Products/ItemProductBadge";
const ProductsTable = ({ orderItems }) => {

  return (
    <Table striped bordered hover responsive className="products-table">
      <thead>
        <tr>
          {/* <th className="col-quantity">Qt</th> */}
          {/* <th className="col-name">Nombre</th> */}
          {/* <th className="col-complements">Complementos</th> */}
          {/* <th className="col-total">Total</th> */}
        </tr>
      </thead>
      <tbody>
        {orderItems?.map((item, index) => {

          const ItemsComplements = ({ complements }) => {
            if (!complements || complements.length === 0) return null;

            return complements.map((complement, index) => {
              const name = complement.codes ? complement?.name + " (" + complement?.codes.join(", ") + ")" : complement?.name;

              return (
                <div key={index}>
                  <Badge className="badge m-2 badge-primary">
                    {complement?.quantity || 1}
                  </Badge>
                  <ItemProductBadge name={name} color={complement?.colorPrimary} />
                </div>
              );
            });
          }

          return (
            <tr key={index}>
              <td>
                <Badge variant="primary" className="m-1">
                  {item?.quantity || 1}
                </Badge>
              </td>
              <td>
                <span
                  style={{ backgroundColor: item?.colorPrimary || "#000" }}
                  className="badge m-1">
                  {item?.name} {item?.codes ? "(" + item?.codes.join(", ") + ")" : ""}
                </span>
                <span>
                  <ItemsComplements complements={item?.complements} />
                </span>
              </td>

              {/* <td>{formatearNumeroConPuntos(priceTotalProducts)}</td> */}
            </tr>
          )
        })}
      </tbody>
    </Table >
  );
}

export { ProductsTable };