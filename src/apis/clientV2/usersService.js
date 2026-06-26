import axios from 'axios';
import { getUrlBackend } from '../../Utils/getUrlApiByOriginPath';


class UsersService {
  constructor(token) {
    this.BASE_URL = getUrlBackend();
    this.element = 'users'

    this.api = axios.create({
      baseURL: `${this.BASE_URL}/api/v2/${this.element}`, // Reemplaza con la URL de tu API
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  async me() {
    try {
      const rta = await this.api.get(`/me`)
      return rta.data.body
    } catch (error) {
      throw error?.response?.data
    }
  }
  async updatePhone(phone) {
    try {
      const rta = await this.api.patch(`/`, { phone })
      return rta
    } catch (error) {
      throw error;
    }
  }
  async updateRole(id, role) {
    try {
      const data = { roles: role }
      const rta = await this.api.patch(`/role/${id}`, data)
      return rta
    } catch (error) {
      throw error;
    }
  }
  async updateAssignedKitchens(id, kitchens) {
    try {
      const data = { kitchensIds: kitchens }
      const rta = await this.api.patch(`/assignedKitchens/${id}`, data)
      return rta
    }
    catch (error) {
      throw error;
    }
  }
  async getByIdUser(id) {
    const rta = await this.api.get(`/${id}`)
    return rta.data
  }
  async getAll(pagination, filter) {
    const { page, limit } = pagination || {};
    const query = new URLSearchParams();
    if (page) query.append('page', page);
    if (limit) query.append('limit', limit);
    if (filter) {
      if (filter.key) query.append('key', filter.key);
      if (filter.value) query.append('value', filter.value);
      if (filter.option) query.append('option', filter.option);
    }
    const rta = await this.api.get(`?${query.toString()}`)
    return rta.data
  }
  async create(data, token) {
    try {
      const rta = await this.api.post(`/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return rta
    } catch (error) {
      throw error;
    }
  }
  async getByRole(role) {
    const rta = await this.getAll({ page: 1, limit: 100 }, { key: 'roles', value: role, option: 'array-contains' })
    return rta
  }

  async searchByEmail(email, pagination = { page: 1, limit: 12 }) {
    return this.getAll(pagination, { key: 'email', value: email, option: '==' })
  }

  async searchByPhone(phone, pagination = { page: 1, limit: 12 }) {
    return this.getAll(pagination, { key: 'phone', value: phone, option: '==' })
  }

  async searchByName(name, pagination = { page: 1, limit: 12 }) {
    return this.getAll(pagination, { key: 'name', value: name, option: 'contains' })
  }
}

export { UsersService }