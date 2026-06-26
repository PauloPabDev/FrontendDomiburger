import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Badge, Button,
  Spinner, Alert, Image
} from 'react-bootstrap';
import {
  FaArrowLeft, FaUser, FaEnvelope, FaShieldAlt,
  FaCoins, FaCalendarAlt, FaIdCard
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import LayoutAdmin from '../../Layout/Admin';
import { useAuth } from '../../Context/AuthContext';
import { UsersService } from '../../apis/clientV2/usersService';
import { AddPointsForm } from '../../components/Users';
import { ADMIN_ROUTES } from '../../Utils/const/namesRutes';

const ROLE_VARIANTS = {
  admin: 'danger',
  recepcion: 'primary',
  cocina: 'warning',
  domiciliario: 'success',
  user: 'secondary',
};

const formatTimestamp = (ts) => {
  if (!ts) return '—';
  const ms = ts._seconds ? ts._seconds * 1000 : ts;
  return new Date(ms).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    if (!id || !token) return;
    setLoading(true);
    setError(null);
    try {
      const service = new UsersService(token);
      const res = await service.getByIdUser(id);
      setUser(res?.body || res);
    } catch (_err) {
      setError('No se pudo cargar la información del usuario.');
      toast.error('Error al cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id, token]);

  const handleBack = () => navigate(ADMIN_ROUTES.routes.USER_MANAGEMENT);

  if (loading) {
    return (
      <LayoutAdmin>
        <Container fluid className="py-5">
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando usuario...</p>
          </div>
        </Container>
      </LayoutAdmin>
    );
  }

  if (error || !user) {
    return (
      <LayoutAdmin>
        <Container fluid className="py-4">
          <Alert variant="danger" className="text-center">
            <h5>Usuario no encontrado</h5>
            <p className="mb-3">{error || 'No se pudo obtener la información.'}</p>
            <Button variant="primary" size="sm" onClick={handleBack}>
              <FaArrowLeft className="me-2" /> Volver a Usuarios
            </Button>
          </Alert>
        </Container>
      </LayoutAdmin>
    );
  }

  const avatarSrc = user.photoUrl || user.photoURL;
  const displayName = user.displayName || user.name || 'Sin nombre';

  return (
    <LayoutAdmin>
      <Container fluid className="py-4 px-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center gap-3">
              <Button variant="outline-secondary" size="sm" onClick={handleBack}>
                <FaArrowLeft />
              </Button>
              <div>
                <h2 className="mb-0 text-primary fw-bold">
                  <FaUser className="me-2" />
                  Detalle de Usuario
                </h2>
                <p className="text-muted mb-0 small">ID: {user.id}</p>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Perfil principal */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm text-center h-100">
              <Card.Body className="p-4">
                {/* Avatar */}
                <div className="mb-3 position-relative d-inline-block">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      roundedCircle
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover', border: '3px solid #dee2e6' }}
                      alt={displayName}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto"
                      style={{ width: 100, height: 100 }}
                    >
                      <FaUser className="text-primary fs-2" />
                    </div>
                  )}
                </div>

                <h4 className="fw-bold mb-1">{displayName}</h4>
                <p className="text-muted small mb-3">{user.email}</p>

                {/* Roles */}
                <div className="d-flex flex-wrap justify-content-center gap-1 mb-4">
                  {(user.roles || []).map((role) => (
                    <Badge
                      key={role}
                      bg={ROLE_VARIANTS[role] || 'secondary'}
                      className="text-capitalize px-2 py-1"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>

                {/* Puntos */}
                <div className="rounded-3 bg-warning bg-opacity-10 p-3 d-flex align-items-center justify-content-center gap-2">
                  <FaCoins className="text-warning fs-4" />
                  <div className="text-start">
                    <div className="text-muted small">Puntos acumulados</div>
                    <div className="fs-4 fw-bold text-warning-emphasis">{user.pointsBalance ?? 0}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Info detallada */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom">
                <span className="fw-semibold">Información de la cuenta</span>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-flex flex-column gap-3">

                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-2 bg-primary bg-opacity-10 p-2 flex-shrink-0">
                      <FaUser className="text-primary" />
                    </div>
                    <div>
                      <div className="text-muted small">Nombre</div>
                      <div className="fw-semibold">{user.name || displayName}</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-2 bg-info bg-opacity-10 p-2 flex-shrink-0">
                      <FaEnvelope className="text-info" />
                    </div>
                    <div>
                      <div className="text-muted small">Correo electrónico</div>
                      <div className="fw-semibold" style={{ wordBreak: 'break-all' }}>{user.email}</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-2 bg-success bg-opacity-10 p-2 flex-shrink-0">
                      <FaIdCard className="text-success" />
                    </div>
                    <div>
                      <div className="text-muted small">ID de usuario</div>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: 180, fontSize: '0.85rem' }}>
                        {user.id}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-2 bg-warning bg-opacity-10 p-2 flex-shrink-0">
                      <FaShieldAlt className="text-warning" />
                    </div>
                    <div>
                      <div className="text-muted small">Roles</div>
                      <div className="fw-semibold text-capitalize">
                        {(user.roles || []).join(', ') || '—'}
                      </div>
                    </div>
                  </div>

                  <hr className="my-1" />

                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-2 bg-secondary bg-opacity-10 p-2 flex-shrink-0">
                      <FaCalendarAlt className="text-secondary" />
                    </div>
                    <div>
                      <div className="text-muted small">Creado</div>
                      <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                        {formatTimestamp(user.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-2 bg-secondary bg-opacity-10 p-2 flex-shrink-0">
                      <FaCalendarAlt className="text-secondary" />
                    </div>
                    <div>
                      <div className="text-muted small">Última actualización</div>
                      <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                        {formatTimestamp(user.updatedAt)}
                      </div>
                    </div>
                  </div>

                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Agregar puntos */}
          <Col lg={4}>
            <AddPointsForm
              userId={user.id}
              currentPoints={user.pointsBalance}
              onSuccess={fetchUser}
            />
          </Col>
        </Row>
      </Container>
    </LayoutAdmin>
  );
};

export { UserDetail };
