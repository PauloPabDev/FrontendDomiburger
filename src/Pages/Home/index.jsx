import LayoutRecepcion from "../../Layout/Recepcion";
import { getUrlBackend, getUrlCodigos, getUrlSocket } from "../../Utils/getUrlApiByOriginPath";
import { getIdToken } from 'firebase/auth';
import { FirebaseAuth } from '../../firebase/config';
import { useEffect, useState } from "react";

const Experimentos = () => {
  const [token, setToken] = useState('');
  useEffect(() => {
    const getToken = async () => {
      const getToken = await getIdToken(FirebaseAuth.currentUser);
      setToken(getToken);
    };
    getToken();
  }, []);

  const apiUrl = getUrlBackend();
  const urlSocket = getUrlSocket();
  const urlCodigo = getUrlCodigos()
  return (
    <>
      <LayoutRecepcion>

        <h1>Experimentos</h1>

        <p>Esta es una página de experimentos</p>

        <div className="alert alert-info">
          <strong>API URL:</strong> {apiUrl}
        </div>

        <div className="alert alert-info">
          <strong>Socket URL:</strong> {urlSocket}
        </div>

        <div className="alert alert-info">
          <strong>Códigos URL:</strong> {urlCodigo}
        </div>

        <div className="alert alert-info">
          <strong>Token:</strong> {token}
        </div>


      </LayoutRecepcion>
    </>
  );
};

export default Experimentos;
