import { useState } from "react";
import { useClientUpdate } from "../../hooks/api/clients/useClientUpdate";
import { Button, Form, Spinner, Alert, Card } from "react-bootstrap";

const EditClient = ({ client, setClient }) => {
  const [newDataClient, setNewDataClient] = useState({ ...client });
  const [submitted, setSubmitted] = useState(false);

  const {
    error,
    data,
    loading,
    updateClient
  } = useClientUpdate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDataClient((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rta = await updateClient(client.id, newDataClient);
    if (rta) {
      setClient((prev) => ({
        ...prev,
        ...newDataClient
      }));
    }
    setSubmitted(true);

  };




  return (
    <Card className="p-4 shadow-sm">
      <h2 className="mb-4">Editar Cliente</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={newDataClient.name}
            onChange={handleChange}
            placeholder="Ingresa el nombre del cliente"
            required
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "Actualizar"}
        </Button>
      </Form>

      {submitted && data && (
        <Alert variant="success" className="mt-3">
          Cliente actualizado correctamente.
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mt-3">
          Error al actualizar cliente: {error.message}
        </Alert>
      )}
    </Card>
  );
};

export { EditClient };
