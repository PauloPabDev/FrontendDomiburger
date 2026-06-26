import CardProduct from '../../CardProduct';

// React Bootstrap
import { Container, Row, Col } from 'react-bootstrap';

// Imágenes
import imgHamburguesa from '../../../assets/img/hamburguesa.png';
import imgCombo from '../../../assets/img/combo.png';
import salsaDeAjo from '../../../assets/img/salsaDeAjo2.jpeg';
import PapaVaquera from '../../../assets/img/Vaquero.jpeg';
import PapaTroyana from '../../../assets/img/Troyana.jpeg';
// Constantes
import { PRODUCTS } from '../../../Utils/constList';

function ProductsSection({ listaProductosOrder, incrementCount, decrementCount }) {
  // Función auxiliar para obtener la cantidad de un producto específico
  const getProductCount = (productName) =>
    listaProductosOrder.filter((item) => item.name === productName).length;

  // Lista de productos
  const products = [
    {
      title: 'Nueva Salsa de Ajo',
      description: 'Nuestra propia salsa de Ajo artesanal.',
      img: salsaDeAjo,
      productKey: PRODUCTS.SalsaDeAjo,
      isNew: true,
      moreInfo: 'La salsa de casa. La misma que usamos en la hamburguesa'
    },
    {
      title: 'Hamburguesa Artesanal',
      description: 'La clásica hamburguesa artesanal.',
      img: imgHamburguesa,
      productKey: PRODUCTS.Hamburguesa,

    },
    {
      title: 'Combo Especial',
      description: 'Hamburguesa + Papas fritas risadas.',
      img: imgCombo,
      productKey: PRODUCTS.Combo,
    },
    {
      title: 'Papas Vaquera',
      description: 'Deliciosas papas vaquera.',
      img: PapaVaquera,
      productKey: PRODUCTS.PapaVaquera,
    },
    {
      title: 'Papas Troyana',
      description: 'Papas troyana especiales.',
      img: PapaTroyana,
      productKey: PRODUCTS.PapaTroyana,
    },
    {
      title: 'Cheesecake de Fresa',
      description: 'Delicioso cheesecake de fresa.',
      img: 'https://res.cloudinary.com/dzcmadjlq/image/upload/v1700000000/cheesecake_fresa.jpg',
      productKey: PRODUCTS.CheesecakeFresa,
    },
    {
      title: 'Jugo de Mora',
      description: 'Refrescante jugo de mora natural.',
      img: 'https://res.cloudinary.com/dzcmadjlq/image/upload/v1700000000/jugo_mora.jpg',
      productKey: PRODUCTS.JugoMora,
    }
  ];

  return (
    <Container className="my-3">
      <h2 className="text-center mb-5 fw-bold text fs-1">Nuestros Productos</h2>
      <Row className="g-3 text-center">
        {products.map(({ title, description, img, productKey, isNew, moreInfo }) => (
          <Col key={productKey} xs={12} sm={12} md={6} lg={4} className="d-flex justify-content-center text-center">
            <CardProduct
              title={title}
              description={description}
              img={img}
              count={getProductCount(productKey)}
              incrementCount={() => incrementCount(productKey)}
              decrementCount={() => decrementCount(productKey)}
              isNew={isNew}
              toggleInfo={() => {}}
              moreInfo={moreInfo}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ProductsSection;
