import { Image } from "react-bootstrap"
import photoGenericUser from "../../../assets/img/photoGeneric.jpg"

const NameAndPhoto = ({ name, photo, client }) => {
  return (
    <div className="d-flex align-items-center">
      <Image
        src={photo || photoGenericUser}
        alt={name || "Sin nombre?"}
        style={{
          width: "40px",
          height: "40px",
        }}
        roundedCircle
      />
      <span className="ms-2">{name || "Sin nombre?"}</span>
    </div>
  )
}

export { NameAndPhoto }