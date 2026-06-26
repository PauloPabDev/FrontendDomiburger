import { useEffect, useState } from 'react';
import LayoutCliente from '../../Layout/LayoutCliente';
import { NavbarCliente } from '../../components/Navbar/NavbarCliente';
import TimeElapsed from '../../components/TimeElapsed';
import { postInstagram } from '../../apis/postInstagram/getPost';
import Footer from '../../components/Footer/Footer'; // Importar el nuevo componente Footer

const YEAR_START = new Date(2016, 6, 1);

const Nosotros = () => {
  //podemos cargar una imagenes desde la api de postInstagram
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await postInstagram.getPosts(3);
        setPosts(posts);
      } catch (_error) {
      }
    };
    fetchPosts();
  }, []);

  return (
    <LayoutCliente>
      <NavbarCliente />
      <div className="container my-5">
        <div className="text-center mb-4">
          <h1 className="display-4 fw-bold text">DOMIBURGUER</h1>
          <p className="text-muted fs-5">
            Creamos Nuestro Propio Sabor
          </p>
        </div>
        <div className="card shadow-lg border-0 mb-4">
          <div className="card-body">
            <h2 className="card-title text-primary">¿Quiénes somos?</h2>
            <p className="card-text">
              ¡Vinimos creciendo y aprendiendo desde el 2016, hace <TimeElapsed startDate={YEAR_START} />!
            </p>
            <p className="card-text">
              👨‍👩‍👧‍👦 Somos una empresa familiar que ha aprendido a crear un servicio maravilloso y decidió compartirlo.
            </p>
            <p className="card-text">
              Nuestro propósito en la vida es entregar felicidad hasta tu casa; las hamburguesas son secundarias.
            </p>
            <div className="text-center my-4">
              <img src="ruta/a/tu/imagen.jpg" alt="Imagen de Domiburguer" className="img-fluid rounded" />
            </div>
            <div className="row">
              {posts.map(post => (
                <div key={post.id} className="col-md-4 mb-4">
                  <div className="card">
                    <img src={post.media_url} alt={post.caption} className="card-img-top" />
                    <div className="card-body">
                      <p className="card-text">{post.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <h2 className="card-title text-primary">¿Cómo Trabajamos?</h2>
            <p className="card-text">
              Creamos obras maestras culinarias que deleitan los sentidos y satisfacen los antojos más exigentes. Nos encargamos de conseguir los ingredientes más frescos y de mejor calidad, lavamos y procesamos todo nosotros mismos, el pan, la carne, la salsa de la casa (mayonesa), pepino, cebolla, la papa, etc. Además de eso, también manejamos nuestra propia flota de mensajeros, un equipo dedicado y una logística eficiente, podemos asegurar que su pedido llegue caliente y fresco, listo para ser disfrutado.
            </p>
            <p className="card-text">
              Al comprar una Domi Burguer, logramos hasta lo imposible para llevarte esta experiencia culinaria excepcional directamente a su puerta. Para poder entregarte un cofre con un tesoro, una caja hecha a la medida que en su interior hay un manjar hecho por los dioses.
            </p>
          </div>
        </div>
      </div>
      <Footer /> {/* Usar el nuevo componente Footer */}
    </LayoutCliente>
  );
};

export default Nosotros;
