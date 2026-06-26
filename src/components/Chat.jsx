// components/Chat.js
import { useEffect, useState } from 'react';
import useSocket from '../hooks/useSocket';
import { getUrlSocket } from '../Utils/getUrlApiByOriginPath';

const Chat = () => {
  const [newMessage, setNewMessage] = useState('');
  const socket = useSocket(getUrlSocket());

  useEffect(() => {
    if (!socket) return;

    // Escuchar mensajes entrantes
    socket.on('message', (newMessage) => {
      setNewMessage(newMessage);
    });

    // Manejo de errores de conexión
    socket.on('connect_error', (error) => {
    });

    // Limpiar al desmontar el componente
    return () => {
      socket.off('message');
      socket.off('connect_error');
    };
  }, [socket]);

  return (
    <div>
      <h2>Chat</h2>
      <ul>
        <li>{JSON.stringify(newMessage)}</li>
      </ul>
    </div >
  );
};

export default Chat;
