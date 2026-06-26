import { useState } from 'react';
import Joi from 'joi';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ProductsService } from '../../apis/clientV2/ProductsService';
import { useAuth } from '../../Context/AuthContext';
import LayoutAdmin from '../../Layout/Admin';
import { useNavigate } from 'react-router-dom';

// Esquema de validación con Joi
const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    'any.required': 'El nombre es obligatorio',
    'string.min': 'El nombre debe tener al menos 3 caracteres',
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'any.required': 'La descripción es obligatoria',
    'string.min': 'La descripción debe tener al menos 10 caracteres',
  }),
  colorPrimary: Joi.string().required().messages({
    'any.required': 'El color primario es obligatorio',
  }),
  colorSecondary: Joi.string().required().messages({
    'any.required': 'El color secundario es obligatorio',
  }),
  photos: Joi.array().items(Joi.string().uri()).messages({
    'any.required': 'Debe incluir al menos una foto',
    'array.min': 'Debe incluir al menos una foto',
    'string.uri': 'Cada foto debe ser una URL válida',
  }),
  price: Joi.number().min(0).required().messages({
    'any.required': 'El precio es obligatorio',
    'number.min': 'El precio debe ser un número positivo o 0',
  }),
  type: Joi.string().valid('product', 'complement').required().messages({
    'any.required': 'El tipo es obligatorio',
    'any.only': 'El tipo debe ser "product" o "complement"',
  }),
  secret: Joi.boolean().optional(),
  id: Joi.string().optional(),
});

const CreateProduct = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorPrimary, setColorPrimary] = useState('#000000'); // Color por defecto
  const [colorSecondary, setColorSecondary] = useState('#FFFFFF'); // Color por defecto
  const [photos, setPhotos] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('product');
  const [id, setId] = useState('');
  const [secret, setSecret] = useState(false);

  const productService = new ProductsService(token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    const formData = {
      name,
      description,
      colorPrimary: colorPrimary.toString(),
      colorSecondary: colorSecondary.toString(),
      // photos: photos.split(',').map((url) => url.trim()) || [],
      price: parseFloat(price),
      type,
      secret,
    };

    if (id) {
      formData.id = id;
    }

    const validation = createProductSchema.validate(formData, { abortEarly: false });
    if (validation.error) {
      const formattedErrors = validation.error.details.reduce(
        (acc, curr) => ({ ...acc, [curr.context.key]: curr.message }),
        {}
      );
      setErrors(formattedErrors);
      toast.error('Error en la validación del formulario');
      setLoading(false);
      return;
    }

    try {
      await productService.create(formData);
      toast.success('¡Producto creado exitosamente!');

      // Resetear el formulario
      setName('');
      setDescription('');
      setColorPrimary('#000000');
      setColorSecondary('#FFFFFF');
      setPhotos('');
      setPrice('');
      setType('product');
      setId('');
      setSecret(false);

      navigate(-1);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutAdmin>
      <Container className="mt-4">
        <Row>
          <Col md={{ span: 8, offset: 2 }}>
            <h1 className="mb-4 text-center text-primary">Crear Nuevo Producto</h1>

            {error && <Alert variant="danger">Error: {error.message}</Alert>}

            {/* Campo Nombre */}
            <div className="mb-3">
              <label className="form-label fw-bold">Nombre del Producto</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Producto de prueba"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            {/* Campo Descripción */}
            <div className="mb-3">
              <label className="form-label fw-bold">Descripción</label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Este es un producto de prueba..."
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>

            {/* Campo Color Primario */}
            <div className="mb-3">
              <label className="form-label fw-bold">Color Primario</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={colorPrimary}
                onChange={(e) => setColorPrimary(e.target.value)}
              />
            </div>

            {/* Campo Color Secundario */}
            <div className="mb-3">
              <label className="form-label fw-bold">Color Secundario</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={colorSecondary}
                onChange={(e) => setColorSecondary(e.target.value)}
              />
            </div>

            {/* Campo Fotos */}
            <div className="mb-3">
              <label className="form-label fw-bold">Fotos (URLs separadas por comas)</label>
              <input
                type="text"
                className={`form-control ${errors.photos ? 'is-invalid' : ''}`}
                value={photos}
                onChange={(e) => setPhotos(e.target.value)}
                placeholder="Ej: https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              />
              {errors.photos && <div className="invalid-feedback">{errors.photos}</div>}
            </div>

            {/* Campo Precio */}
            <div className="mb-3">
              <label className="form-label fw-bold">Precio</label>
              <input
                type="number"
                className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej: 19.99"
              />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>

            {/* Campo de Id */}
            <div className="mb-3">
              <label className="form-label fw-bold">Id</label>
              <input
                type="text"
                className={`form-control ${errors.id ? 'is-invalid' : ''}`}
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Ej: 1"
              />
              {errors.id && <div className="invalid-feedback">{errors.id}</div>}
            </div>

            {/* type */}
            <div className="mb-3">
              <label className="form-label fw-bold">Tipo</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="product">Producto</option>
                <option value="complement">Complemento</option>
              </select>
            </div>

            {/* Campo Secreto */}
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={secret}
                onChange={(e) => setSecret(e.target.checked)}
              />
              <label className="form-check-label">¿Es un producto secreto?</label>
            </div>

            {/* Botón de Crear Producto */}

            <div className="d-flex justify-content-center mt-4 mb-4">
              <Button variant="primary" onClick={handleSubmit} size="lg" disabled={loading}>
                {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Crear Producto'}
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </LayoutAdmin>
  );
};

export { CreateProduct };
