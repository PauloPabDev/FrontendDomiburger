import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUsers, FaTable, FaTh } from 'react-icons/fa';

import { UsersService } from '../../apis/clientV2/usersService';
import { useAuth } from '../../Context/AuthContext';
import PaginationComponent from '../../components/Pagination';
import { UsersFilters, UsersTable, UserDetailsModal, UserCard } from '../../components/Users';
import { ListCardsElements } from '../../components/common/ListCards';
import EditRolesModal from '../../components/Users/EditRolesModal';
import { EditAssignedKitchensModal } from '../../components/Users/EditAssignedKitchensModal';

const UsersManagement = ({ Layout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditRolesModal, setShowEditRolesModal] = useState(false);
  const [showEditKitchensModal, setShowEditKitchensModal] = useState(false);

  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const usersService = new UsersService(token);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const limit = 12;
      const data = await usersService.getAll({ page, limit }, filter);
      setUsers(data?.body || []);
    } catch (err) {
      setError('Error al cargar los usuarios');
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [page, filter, token]);

  useEffect(() => {
    fetchUsers();
  }, [page, filter]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const handleFilter = (filters) => {
    if (filters.length > 0) {
      setFilter(filters[0]);
    } else {
      setFilter(null);
    }
    setSearchParams({ page: 1 });
  };

  const handleClearFilters = () => {
    setFilter(null);
    setSearchParams({ page: 1 });
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditRolesModal(true);
  };

  const handleUpdateRoles = async (roles) => {
    try {
      await usersService.updateRole(selectedUser.id, roles);
      toast.success('Roles actualizados correctamente');
      setShowEditRolesModal(false);
      fetchUsers();
    } catch (err) {
      toast.error('Error al actualizar roles');
    }
  };

  const handleUpdateKitchens = async (kitchens) => {
    try {
      await usersService.updateAssignedKitchens(selectedUser.id, kitchens);
      toast.success('Cocinas actualizadas correctamente');
      setShowEditKitchensModal(false);
      fetchUsers();
    } catch (err) {
      toast.error('Error al actualizar cocinas');
    }
  };

  return (
    <Layout>
      <Container fluid className="px-4 py-3">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h1 className="text-primary fw-bold mb-0">
                <FaUsers className="me-2" />
                Gestion de Usuarios
              </h1>
              <div className="btn-group">
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('table')}
                  title="Vista de tabla"
                >
                  <FaTable />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('cards')}
                  title="Vista de tarjetas"
                >
                  <FaTh />
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <UsersFilters
              onFilter={handleFilter}
              onClear={handleClearFilters}
              loading={loading}
            />
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="text-center">
            {error}
            <Button variant="link" onClick={fetchUsers}>Reintentar</Button>
          </Alert>
        )}

        <Row>
          <Col>
            {viewMode === 'table' ? (
              <UsersTable
                users={users}
                loading={loading}
                onViewDetails={handleViewDetails}
                onEditUser={handleEditUser}
              />
            ) : (
              <ListCardsElements
                elements={users}
                loading={loading}
                error={error}
                handleCardClick={() => toast.info('No se puede crear un usuario desde aqui')}
                CardComponent={UserCard}
                messageText="Crear Usuario"
              />
            )}
          </Col>
        </Row>

        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <PaginationComponent
              page={page}
              handlePageChange={handlePageChange}
            />
          </Col>
        </Row>
      </Container>

      <UserDetailsModal
        show={showDetailsModal}
        handleClose={() => setShowDetailsModal(false)}
        user={selectedUser}
      />

      {selectedUser && (
        <>
          <EditRolesModal
            show={showEditRolesModal}
            handleClose={() => setShowEditRolesModal(false)}
            userRoles={selectedUser?.roles || []}
            onSave={handleUpdateRoles}
          />
          <EditAssignedKitchensModal
            show={showEditKitchensModal}
            handleClose={() => setShowEditKitchensModal(false)}
            assignedKitchens={selectedUser?.assignedKitchens || []}
            onSave={handleUpdateKitchens}
          />
        </>
      )}
    </Layout>
  );
};

export { UsersManagement };
