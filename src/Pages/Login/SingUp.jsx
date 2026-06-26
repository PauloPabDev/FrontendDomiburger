// src/components/SignUp.jsx
import { useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../Firebase/firebaseConfig';
import Layout from '../../Layout/LayoutDefault';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { LOGIN_ROUTES } from '../../Utils/const/namesRutes';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('Registro exitoso. Serás redirigido al inicio de sesión...');
      setTimeout(() => {
        navigate(LOGIN_ROUTES.routes.LOGIN_AUTH);
      }, 2000);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está en uso. Intenta iniciar sesión.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil. Usa al menos 6 caracteres.');
      } else {
        setError('Error al registrar. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    try {
      await signInWithPopup(auth, provider);
      setSuccess('¡Registro con Google exitoso!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('La ventana de registro se cerró antes de completar el proceso.');
      } else {
        setError('Error al registrar con Google. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <Layout>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h2 className="text-center mb-4">Registro</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <form onSubmit={handleSignUp}>
              <div className="mb-3">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Registrarse
              </button>
            </form>
            <hr />
            <button type="button" className="btn btn-outline-dark w-100" onClick={handleGoogleSignUp}>
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                alt="Google logo"
                className="me-2"
              />
              Registrarse con Google
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
