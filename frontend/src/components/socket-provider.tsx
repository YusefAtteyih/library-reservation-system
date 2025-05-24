"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

// Create a React context for the socket
import React from 'react';

const SocketContext = React.createContext(null);

export const useSocket = () => React.useContext(SocketContext);

export function SocketProvider({ children }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only initialize socket if user is logged in
    if (!session?.user) return;

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);

      // Join user-specific room for notifications
      socketInstance.emit('joinRoom', `user-${session.user.id}`);

      // If user is admin, join admin dashboard room
      if (session.user.role === 'ADMIN') {
        socketInstance.emit('joinRoom', 'admin-dashboard');
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Set socket instance
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [session]);

  // Provide socket instance and connection status
  const value = {
    socket,
    isConnected,
    // Helper methods
    joinRoom: (roomId) => {
      if (socket && isConnected) {
        socket.emit('joinRoom', roomId);
      }
    },
    leaveRoom: (roomId) => {
      if (socket && isConnected) {
        socket.emit('leaveRoom', roomId);
      }
    },
    // Subscribe to room/seat availability updates
    subscribeToResource: (type, id, callback) => {
      if (socket && isConnected) {
        const roomName = `${type}-${id}`;
        socket.emit('joinRoom', roomName);
        
        const eventName = type === 'room' ? 'roomAvailabilityUpdate' : 'seatAvailabilityUpdate';
        socket.on(eventName, (data) => {
          if (data[`${type}Id`] === id) {
            callback(data);
          }
        });
        
        // Return unsubscribe function
        return () => {
          socket.off(eventName);
          socket.emit('leaveRoom', roomName);
        };
      }
      return () => {};
    },
    // Subscribe to occupancy updates (admin only)
    subscribeToOccupancy: (callback) => {
      if (socket && isConnected && session?.user?.role === 'ADMIN') {
        socket.on('occupancyUpdate', callback);
        return () => socket.off('occupancyUpdate');
      }
      return () => {};
    },
    // Subscribe to notifications
    subscribeToNotifications: (callback) => {
      if (socket && isConnected) {
        socket.on('notification', callback);
        return () => socket.off('notification');
      }
      return () => {};
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
