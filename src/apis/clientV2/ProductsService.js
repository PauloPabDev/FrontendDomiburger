import axios from 'axios';
import { getUrlBackend } from '../../Utils/getUrlApiByOriginPath';

class ProductsService {
  constructor(token) {
    this.BASE_URL = getUrlBackend();
    this.element = 'products'

    const headers = token ? {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    }

    this.api = axios.create({
      baseURL: `${this.BASE_URL}/api/v2/${this.element}`, // Reemplaza con la URL de tu API
      headers,
    });
  }
  async getAll(pagination, filter) {
    const { page, limit } = pagination || { page: 1, limit: 100 };
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
  async getSelectProducts(id) {
    const rta = await this.api.get(`/selectProducts/${id}`)
    return rta
  }
  async getByIdUser(id) {
    try {
      const rta = await this.api.get(`/user/${id}`)
      return rta
    } catch (error) {
      throw error;
    }
  }
  async create(data) {
    try {
      const rta = await this.api.post(`/`, data);
      return rta
    } catch (error) {
      throw error;
    }
  }
  async update(id, data) {
    try {
      const rta = await this.api.put(`/${id}`, data);
      return rta.data
    } catch (error) {
      throw error.response.data
    }
  }
}

export { ProductsService }