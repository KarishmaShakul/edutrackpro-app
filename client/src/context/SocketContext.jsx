import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { setConnected, userOnline, userOffline, setOnlineUsers } from '../store/slices/socketSlice.js';
import { incrementUnreadMsg } from '../store/slices/uiSlice.js';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const dispatch  = useDispatch();
  const { user, isAuth } = useSelector(s => s.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuth || !user) return;

    const token = localStorage.getItem('accessToken');

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth:            { token },
      transports:      ['websocket'],
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      dispatch(setConnected(true));
      socket.emit('presence:list');
    });

    socket.on('disconnect', () => dispatch(setConnected(false)));

    socket.on('presence:online',  ({ userId }) => dispatch(userOnline(userId)));
    socket.on('presence:offline', ({ userId }) => dispatch(userOffline(userId)));
    socket.on('presence:list',    (ids)        => dispatch(setOnlineUsers(ids)));

    socket.on('message:notification', ({ sender, text }) => {
      dispatch(incrementUnreadMsg());
      toast(`💬 ${sender.name}: ${text.slice(0, 50)}`, { duration: 4000 });
    });

    socket.on('announcement', ({ title, text }) => {
      toast(`📢 ${title}: ${text.slice(0, 80)}`, { duration: 6000 });
    });

    socket.on('grade:published', ({ courseName }) => {
      toast.success(`Grades published for ${courseName}`);
    });

    socket.on('new:assignment', ({ courseName, title }) => {
      toast(`📝 New assignment in ${courseName}: ${title}`, { duration: 5000 });
    });

    socket.on('attendance:marked', ({ courseName, status }) => {
      if (status === 'absent') {
        toast.error(`You were marked absent in ${courseName}`);
      }
    });

    return () => {
      socket.disconnect();
      dispatch(setConnected(false));
    };
  }, [isAuth, user, dispatch]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
