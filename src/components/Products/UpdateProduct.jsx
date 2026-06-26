import { Col, Row, Card, Button, Form as BootstrapForm } from "react-bootstrap";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useUpdateProduct } from "../../hooks/api/products/useUpdateProduct";

const UpdateProduct = ({ product, handleClose }) => {
  const initialValues = {
    name: product.name || "",
    description: product.description || "",
    type: product.type || "Producto",
    price: product.price || "",
    colorPrimary: product.colorPrimary || "#000000",
    colorSecondary: product.colorSecondary || "#ffffff",
    secret: product.secret || false,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("El nombre es obligatorio"),
    description: Yup.string().required("La descripción es obligatoria"),
    type: Yup.string()
      .oneOf(["product", "complement"], "Tipo no válido")
      .required("Selecciona un tipo"),
    price: Yup.number().positive("Debe ser un precio válido"),
  });

  const { updateProduct } = useUpdateProduct();

  const handleSubmit = async (values) => {
    // 1) Detectar cambios: quedarnos sólo con campos distintos
    const cambios = Object.keys(values).reduce((acc, key) => {
      // para checkbox (boolean), usar !==
      if (values[key] !== initialValues[key]) {
        acc[key] = values[key];
      }
      return acc;
    }, {});

    if (Object.keys(cambios).length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    try {
      await updateProduct(product.id, cambios);
      toast.success("Producto actualizado con éxito!");
      handleClose();
    } catch (err) {
      toast.error("Error al actualizar el producto");
    }
  };

  return (
    <Col>
      <Card className="shadow-lg p-4">
        <Card.Body>
          <h3 className="text-center text-primary">Actualizar Producto</h3>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form>
                {/* Nombre */}
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Nombre del Producto</BootstrapForm.Label>
                  <Field name="name" className="form-control" />
                  <ErrorMessage name="name" component="div" className="text-danger" />
                </BootstrapForm.Group>

                {/* Descripción */}
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Descripción</BootstrapForm.Label>
                  <Field as="textarea" name="description" className="form-control" />
                  <ErrorMessage name="description" component="div" className="text-danger" />
                </BootstrapForm.Group>

                {/* Tipo */}
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Tipo</BootstrapForm.Label>
                  <Field as="select" name="type" className="form-select">
                    <option value="product">Producto</option>
                    <option value="complement">Adición</option>
                  </Field>
                  <ErrorMessage name="type" component="div" className="text-danger" />
                </BootstrapForm.Group>

                {/* Precio */}
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label>Precio</BootstrapForm.Label>
                  <Field name="price" type="number" className="form-control" />
                  <ErrorMessage name="price" component="div" className="text-danger" />
                </BootstrapForm.Group>

                {/* Colores */}
                <Row className="mb-3">
                  <Col>
                    <BootstrapForm.Label>Color Primario</BootstrapForm.Label>
                    <Field name="colorPrimary" type="color" className="form-control form-control-color" />
                  </Col>
                  <Col>
                    <BootstrapForm.Label>Color Secundario</BootstrapForm.Label>
                    <Field name="colorSecondary" type="color" className="form-control form-control-color" />
                  </Col>
                </Row>

                {/* Secreto */}
                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Check
                    type="checkbox"
                    label="Producto Secreto"
                    checked={values.secret}
                    onChange={(e) => setFieldValue("secret", e.target.checked)}
                  />
                </BootstrapForm.Group>

                {/* Botones */}
                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    Guardar Cambios
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Col>
  );
};

export { UpdateProduct };
