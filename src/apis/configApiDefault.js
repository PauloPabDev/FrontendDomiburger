import axios from 'axios';
import { getUrlBackend } from '../Utils/getUrlApiByOriginPath';

const BASE_URL = getUrlBackend();
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`, // Reemplaza con la URL de tu API
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;