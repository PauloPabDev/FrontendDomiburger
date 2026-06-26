// src/components/Login.jsx
import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FirebaseAuth } from '../../firebase/config';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, Button } from 'react-bootstrap';
import { UserLayout } from '../../Layout/UserLayout';

const Login1 = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();
  const location = useLocation();

  // Determinar la ruta de redirección (si existe)
  const from = location.state?.from?.pathname || '/me';

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(FirebaseAuth, provider);
      setSuccess('¡Inicio de sesión con Google exitoso!');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('La ventana de inicio de sesión se cerró antes de completar el proceso.');
      } else {
        setError('Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <UserLayout>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h2 className="text-center mb-4">Inicio de Sesión</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <hr />
            <div className="text-center mb-4">
              <p className="text-muted">
                Inicia sesión con un solo clic y disfruta de una experiencia rápida y segura.
              </p>
            </div>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="btn w-100 border mb-5"
              onClick={handleGoogleLogin}
            >
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                alt="Google logo"
                className="me-2"
              />
              Iniciar sesión con Google
            </Button>

          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export { Login1 };
