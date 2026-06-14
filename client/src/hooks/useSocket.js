import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';

// Subscribe to a socket event inside any component
export const useSocketEvent = (event, handler) => {
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket, event, handler]);
};

// Join a room and leave on unmount
export const useSocketRoom = (room) => {
  const socket = useSocket();
  useEffect(() => {
    if (!socket || !room) return;
    socket.emit(`join:${room.split(':')[0]}`, room.split(':')[1]);
    return () => socket.emit(`leave:${room.split(':')[0]}`, room.split(':')[1]);
  }, [socket, room]);
};