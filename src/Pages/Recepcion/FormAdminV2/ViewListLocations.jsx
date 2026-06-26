import { useEffect, useState } from "react";
import { Col, Row, Container, Spinner, Alert, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import CardCreate from "../../../components/common/CardCreate";
import ReusableModal from "../../../components/common/ReusableModal";
import { CreateLocationComponent } from "../../User/CreateLocation";
import { useFindLocationsByIdClient } from "../../../hooks/api/useFindLocationsByIdClient";
import { useDeleteLocation } from "../../../hooks/api/locations/useDeleteLocation";
import { LocationCard } from "../../../components/Locations/LocationCard";

const ViewListLocations = ({
  locationIdSelect,
  setLocationIdSelect,
  clientId,
  userId,
  dataClient,
}) => {
  // Hook personalizado para obtener las ubicaciones
  const { locations, loading, error, findLocationsByIdClient } =
    useFindLocationsByIdClient();

  // Hook para eliminar ubicaciones
  const { deleteLocation, loading: deleting, error: deleteError } = useDeleteLocation();

  useEffect(() => {
    if (deleteError) {
      toast.error(`Error al eliminar: ${deleteError}`);
    }
  }, [deleteError]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  // Cuando 'clientId' cambia, cargamos ubicaciones
  useEffect(() => {
    if (clientId) {
      findLocationsByIdClient(clientId);
    } else if (userId) {
      // Aquí podrías usar otra función para encontrar ubicaciones por usuario
    }
  }, [clientId, userId, dataClient]);

  // Si no hay dataClient, muestra algo por defecto (opcional)
  useEffect(() => {
    if (!dataClient) {
      findLocationsByIdClient(null);
    }
  }, [dataClient]);

  const openCreateLocationClient = () => {
    if (!clientId) {
      toast.warning("No se ha seleccionado un cliente.");
      return;
    }
    toast.info("Abriendo formulario de creación de ubicación...");
    setShowModal(true);
  };

  const successForm = () => {
    toast.success("¡Ubicación creada exitosamente!");
    setShowModal(false);
    // Recargamos la lista de ubicaciones
    findLocationsByIdClient(clientId);
  };

  const handleDeleteClick = (location) => {
    setLocationToDelete(location);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;

    try {
      await deleteLocation(locationToDelete.id);
      toast.success("¡Ubicación eliminada exitosamente!");

      // Si la ubicación eliminada estaba seleccionada, limpiar la selección
      if (locationToDelete.id === locationIdSelect) {
        setLocationIdSelect(null);
      }

      // Cerrar modal y limpiar estado
      setShowDeleteModal(false);
      setLocationToDelete(null);

      // Recargar la lista de ubicaciones
      findLocationsByIdClient(clientId);
    } catch (error) {
      toast.error("Error al eliminar la ubicación. Por favor, intente de nuevo.");
    }
  };


  return (
    <Container className="my-4">
      <h2 className="text-center mb-4">Gestión de Ubicaciones</h2>

      {/* Convertimos todo en un formulario */}
      <Form aria-label="Selección de ubicaciones">
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          {loading && (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "150px" }}
            >
              <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <>
              {locations?.length === 0 && (
                <Alert variant="info" className="text-center">
                  No hay ubicaciones registradas.
                </Alert>
              )}

              <Row className="gy-4">
                {/* Tarjeta para crear ubicación */}
                <Col xs={12} sm={6} md={4}>
                  <CardCreate
                    handleCardClick={openCreateLocationClient}
                    messageText="Crear nueva ubicación"
                  />
                </Col>

                {/* Render de ubicaciones como radios - Accesible */}
                {locations?.map((location) => (
                  <Col key={location.id} xs={12} sm={6} md={4}>
                    <div className="position-relative">
                      <Form.Check
                        type="radio"
                        name="locationsGroup"
                        id={`location-${location.id}`}
                        value={location.id}
                        checked={locationIdSelect === location.id}
                        onChange={() => setLocationIdSelect(location.id)}
                        className="visually-hidden"
                      />
                      <label
                        htmlFor={`location-${location.id}`}
                        className="w-100"
                        style={{ cursor: 'pointer' }}
                      >
                        <LocationCard
                          location={location}
                          isSelect={locationIdSelect === location.id}
                          onEdit={() => {
                            // Lógica para editar, si fuera necesario
                          }}
                          onDeled={() => handleDeleteClick(location)}
                        />
                      </label>
                    </div>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </div>
      </Form>

      {/* Modal para crear nueva ubicación */}
      <ReusableModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        title="Crear nueva ubicación"
      >
        <CreateLocationComponent successForm={successForm} clientId={clientId} />
      </ReusableModal>

      {/* Modal de confirmación para eliminar ubicación */}
      <ReusableModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        title="Confirmar eliminación de ubicación"
      >
        <div className="text-center">
          <p>¿Está seguro de que desea eliminar esta ubicación?</p>
          <p className="fw-bold">{locationToDelete?.address}</p>
          <p className="text-muted">Esta acción no se puede deshacer.</p>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </div>
      </ReusableModal>
    </Container>
  );
};

export { ViewListLocations };
