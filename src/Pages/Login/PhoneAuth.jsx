import { useState } from "react";
import { FirebaseAuth as auth, configureRecaptcha } from "../../firebase/config";
import { signInWithPhoneNumber } from "firebase/auth";
import { Alert } from "react-bootstrap";

const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendCode = async () => {
    setError("");
    setSuccess("");

    if (!phoneNumber) {
      setError("Por favor, ingresa un número de teléfono válido.");
      return;
    }

    try {
      configureRecaptcha(); // Configurar el reCAPTCHA

      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setSuccess("Código enviado, revisa tu teléfono.");
    } catch (error) {
      setError("Error al enviar el código. Inténtalo nuevamente.");
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError("Por favor, ingresa el código de verificación.");
      return;
    }

    try {
      await confirmationResult.confirm(verificationCode);
      setSuccess("¡Número verificado correctamente!");
    } catch (error) {
      setError("Código incorrecto. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Autenticación con Teléfono</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <div className="mb-3">
            <label className="form-label">Número de Teléfono</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+52 123 456 7890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <button className="btn btn-primary w-100" onClick={handleSendCode}>
            Enviar Código
          </button>

          <div id="recaptcha-container"></div>

          {confirmationResult && (
            <>
              <div className="mb-3 mt-3">
                <label className="form-label">Código de Verificación</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingresa el código recibido"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              <button className="btn btn-success w-100" onClick={handleVerifyCode}>
                Verificar Código
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneAuth;
