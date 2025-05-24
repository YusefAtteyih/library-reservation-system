import { io, type Socket } from 'socket.io-client';
import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode, useCallback } from 'react';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  isRead: boolean; // Alias for read for compatibility
  createdAt: string;
  updatedAt: string;
}

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribeToNotifications: (userId: string, callback: (notification: Notification) => void) => (() => void) | undefined;
  unsubscribeFromNotifications: (userId: string) => void;
}

const initialContextValue: SocketContextType = {
  socket: null,
  isConnected: false,
  subscribeToNotifications: () => {
    console.warn('SocketProvider not initialized');
    return () => {};
  },
  unsubscribeFromNotifications: () => {
    console.warn('SocketProvider not initialized');
  },
};

export const SocketContext = React.createContext<SocketContextType>(initialContextValue);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.VITE_SOCKET_URL || 'http://localhost:3001', {
      withCredentials: true,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const subscribeToNotifications = useCallback((
    userId: string, 
    callback: (notification: Notification) => void
  ): (() => void) | undefined => {
    if (!socketRef.current) return undefined;
    
    const eventName = `user:${userId}:notification`;
    const handler = (data: unknown) => {
      if (data && typeof data === 'object' && 'id' in data && 'message' in data) {
        callback(data as Notification);
      } else {
        console.warn('Received invalid notification format:', data);
      }
    };
    
    socketRef.current.on(eventName, handler);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off(eventName, handler);
      }
    };
  }, []);

  const unsubscribeFromNotifications = useCallback((userId: string) => {
    if (!socketRef.current) return;
    socketRef.current.off(`user:${userId}:notification`);
  }, []);

  const contextValue: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  return context;
};

export default SocketProvider;
