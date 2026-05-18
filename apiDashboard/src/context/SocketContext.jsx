import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const socketUrl = API_BASE_URL.replace('/api', '');
    
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Join room if user is logged in
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.id) {
        newSocket.emit('join', user.id);
      }
      if (user?.role === 'admin') {
        newSocket.emit('join_admin');
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Provide a function to manually re-join if needed (e.g. after login)
  const joinRoom = (userId, role) => {
    if (socket && userId) {
      socket.emit('join', userId);
      if (role === 'admin') {
        socket.emit('join_admin');
      }
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinRoom }}>
      {children}
    </SocketContext.Provider>
  );
};
