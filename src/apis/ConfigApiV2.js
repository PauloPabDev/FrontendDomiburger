import axios from 'axios';
import { getUrlBackend } from '../Utils/getUrlApiByOriginPath';

const BASE_URL = getUrlBackend();

export const apiV2 = axios.create({
  baseURL: `${BASE_URL}/api/v2`,
  headers: {
    'Content-Type': 'application/json',
  },
});
