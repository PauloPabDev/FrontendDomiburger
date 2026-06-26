import { useState, useRef, useEffect } from 'react';
import { FloatingLabel, Alert, Spinner } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Navigate } from "react-router-dom";
import { getUrlBackend } from '../../Utils/getUrlApiByOriginPath.js';
import { usePreferences } from '../../Context/PreferencesContext.jsx';

function FormLogin() {
  const [validated, setValidated] = useState(false);
  const [redireccionar, setRedireccionar] = useState({ ok: false, to: `` });
  const [messageErrorLogin, setMessageErrorLogin] = useState(null);
  const { setTokenLogin, clearTokenLogin } = usePreferences();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl = getUrlBackend();

  useEffect(clearTokenLogin, [])

  // Refs para manejar los inputs sin acceder al DOM manualmente
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const roleRef = useRef(null);

  const listRoles = [
    { rol: 'admin', url: `recepcion` },
    { rol: 'cliente', url: `home` },
    { rol: 'domiciliario', url: `domiciliarios` },
    { rol: 'recepcion', url: `recepcion` },
    { rol: 'cocinero', url: `cocina` },
  ];

  const enviarFormulario = async () => {
    setLoading(true); // Activa el estado de carga

    const data = {
      username: String(usernameRef.current.value),
      password: String(passwordRef.current.value),
      role: String(roleRef.current.value),
    };

    try {
      const res = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const login = await res.json();

      if (res.status === 200) {
        const token = login.body.token;
        setTokenLogin(login.body);

        document.cookie = `token=${token}; Secure; SameSite=Strict`;

        const roleRedirectMap = {
          admin: `recepcion`,
          cliente: `me`,
          domiciliario: `domiciliario`,
          recepcion: `recepcion`,
          cocinero: `cocina`,
        };

        setRedireccionar({ ok: true, to: `/${roleRedirectMap[login.body.user.role]}` });
      } else {
        setMessageErrorLogin('Usuario o contraseña incorrectas');
      }
    } catch (error) {
      setMessageErrorLogin("Error al conectar con el servidor.");
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      return;
    }

    setValidated(true);
    enviarFormulario();
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit} className="mt-3">
      <Row className="mb-2">
        <Form.Group className="mb-3">
          <FloatingLabel controlId="floatingInput" label="Nombre de usuario" className="mb-3">
            <Form.Control type="text" placeholder="Maria Flores" required ref={usernameRef} />
          </FloatingLabel>

          <div className="d-flex mb-3">
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              ref={passwordRef}
              className="flex-grow-1"
            />
            <Button variant="secondary" onClick={() => setShowPassword(!showPassword)} className="ms-2">
              {showPassword ? "Ocultar" : "Mostrar"}
            </Button>
          </div>

          <Form.Select aria-label="Selecciona tu rol" required ref={roleRef}>
            {listRoles.map(({ rol }) => (
              <option key={rol} value={rol}>
                {rol}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Row>

      {messageErrorLogin && (
        <Row>
          <Alert variant="danger">{messageErrorLogin}</Alert>
        </Row>
      )}

      <Button variant="primary" type="submit" className="w-100" disabled={loading}>
        {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Ingresar"}
      </Button>

      {redireccionar.ok && <Navigate to={redireccionar.to} />}
    </Form>
  );
}

export default FormLogin;
