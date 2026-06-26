import { Container, Row, Col, Card, Button, Form as BootstrapForm } from "react-bootstrap";
import { useState } from "react";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import productService from "../../apis/client/ProductService";
import { useAuth } from "../../Context/AuthContext";

const CrearProducto = () => {
  const { token } = useAuth()

  const [imagePreview, setImagePreview] = useState("");

  const initialValues = {
    name: "",
    description: "",
    type: "Producto",
    price: "",
    imagen: "",
    colorPrimary: "#000000",
    colorSecondary: "#ffffff",
    secret: false,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("El nombre es obligatorio"),
    description: Yup.string().required("La descripción es obligatoria"),
    type: Yup.string().oneOf(["Producto", "Adicion"]).required("Selecciona un tipo"),
    price: Yup.number().positive("Debe ser un precio válido").required("El precio es obligatorio"),
    imagen: Yup.string().url("Debe ser una URL válida").required("La imagen es obligatoria"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    const newProduct = {
      ...values,
    };

    try {
      await productService.create(newProduct, token);
      toast.success("Producto creado con éxito!");
      resetForm();
      setImagePreview("");
    } catch (error) {
      toast.error("No se pudo crear el producto");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg p-4">
            <Card.Body>
              <h3 className="text-center text-primary">Crear Nuevo Producto</h3>
              <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
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
                        <option value="Producto">Producto</option>
                        <option value="Adicion">Adición</option>
                      </Field>
                      <ErrorMessage name="type" component="div" className="text-danger" />
                    </BootstrapForm.Group>

                    {/* Precio */}
                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Label>Precio</BootstrapForm.Label>
                      <Field name="price" type="number" className="form-control" />
                      <ErrorMessage name="price" component="div" className="text-danger" />
                    </BootstrapForm.Group>

                    {/* Imagen */}
                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Label>Imagen (URL)</BootstrapForm.Label>
                      <Field
                        name="imagen"
                        type="text"
                        className="form-control"
                        onChange={(e) => {
                          setFieldValue("imagen", e.target.value);
                          setImagePreview(e.target.value);
                        }}
                      />
                      <ErrorMessage name="imagen" component="div" className="text-danger" />
                    </BootstrapForm.Group>

                    {/* Vista previa de la imagen */}
                    {imagePreview && (
                      <div className="text-center mb-3">
                        <img src={imagePreview} alt="Vista previa" style={{ maxWidth: "100%", maxHeight: "200px" }} />
                      </div>
                    )}

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

                    {/* Producto Secreto */}
                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Check
                        type="checkbox"
                        label="Producto Secreto"
                        checked={values.secret}
                        onChange={(e) => setFieldValue("secret", e.target.checked)}
                      />
                    </BootstrapForm.Group>

                    {/* Botón de enviar */}
                    <div className="text-center">
                      <Button type="submit" variant="primary" className="w-100">
                        Crear Producto
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export { CrearProducto };
