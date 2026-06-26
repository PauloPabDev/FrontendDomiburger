import io from 'socket.io-client';
import { getUrlSocket } from './getUrlApiByOriginPath';

const apiUrl = getUrlSocket();

const socket = io(apiUrl);

export { socket };