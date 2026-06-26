import { Nav, Button, Spinner } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { FirebaseAuth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useAuth } from "../Context/AuthContext";
import { LOGIN_ROUTES } from "../Utils/const/namesRutes";

const AuthButton = () => {
  const { usuarioActual, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(FirebaseAuth);
    } catch (error) {
    }
  };

  return (
    <Nav.Link className="mx-2">
      {loading ? (
        <Spinner animation="border" size="sm" role="status" />
      ) : usuarioActual ? (
        <Button variant="outline-danger" onClick={handleLogout} className="d-flex align-items-center gap-2">
          <FaUserCircle size={20} />
          Cerrar Sesión
        </Button>
      ) : (
        <Button href={LOGIN_ROUTES.routes.LOGIN_AUTH} variant="outline-primary" className="d-flex align-items-center gap-2">
          <FaUserCircle size={20} />
          Iniciar Sesión
        </Button>
      )}
    </Nav.Link>
  );
};

export default AuthButton;
