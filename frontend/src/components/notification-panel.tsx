"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket, type Notification as SocketNotification } from '@/lib/socket-provider';
import { Bell, BellOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Notification extends Omit<SocketNotification, 'createdAt'> {
  read: boolean; // Required to match SocketNotification
  isRead: boolean; // Alias for read
  createdAt: string; // Must match SocketNotification type
  createdAtDate?: Date; // Optional Date object for internal use
  data?: Record<string, unknown>;
}

interface NotificationPanelProps {
  userId?: string;
}

export function NotificationPanel({ userId }: NotificationPanelProps) {
  const { subscribeToNotifications } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle new notification from socket
  const handleNewNotification = useCallback((notification: SocketNotification) => {
    const newNotification: Notification = {
      ...notification,
      isRead: notification.read ?? false,
      createdAt: notification.createdAt, // Already a string
      createdAtDate: new Date(notification.createdAt), // Store as Date for display
      data: (notification as any).data || {} // Type assertion for data property
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Mock data for development
  const loadMockData = useCallback(() => {
    if (process.env.NODE_ENV !== 'development' || notifications.length > 0) return;
    
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: userId || 'mock-user',
        title: 'Reservation Confirmed',
        message: 'Your reservation has been confirmed',
        type: 'success',
        read: false,
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        updatedAt: new Date().toISOString(),
        data: { reservationId: '123' }
      },
      {
        id: '2',
        userId: userId || 'mock-user',
        title: 'Check-in Reminder',
        message: 'Your reservation starts in 15 minutes',
        type: 'info',
        read: false,
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        updatedAt: new Date().toISOString(),
        data: { reservationId: '123', startTime: new Date().toISOString() }
      },
      {
        id: '3',
        userId: userId || 'mock-user',
        title: 'Book Due Soon',
        message: 'The book "Introduction to Algorithms" is due tomorrow',
        type: 'warning',
        read: true,
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        updatedAt: new Date().toISOString(),
        data: { bookId: '456', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() }
      },
      {
        id: '4',
        userId: userId || 'mock-user',
        title: 'Overdue Book',
        message: 'The book "Clean Code" is 3 days overdue',
        type: 'error',
        read: false,
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
        data: { bookId: '789', dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() }
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    setLoading(false);
  }, [notifications.length, userId]);

  // Load mock data in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      loadMockData();
    }
  }, [loadMockData]);

  // Subscribe to notifications when user is available
  useEffect(() => {
    if (!userId || !subscribeToNotifications) return;
    
    // Wrap the callback to ensure it matches the expected signature
    const notificationCallback = (notification: Notification) => {
      handleNewNotification(notification);
    };
    
    const unsubscribe = subscribeToNotifications(userId, notificationCallback);
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, subscribeToNotifications, handleNewNotification]);

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = useCallback((date: Date | string): string => {
    const now = new Date();
    const target = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    
    return 'just now';
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      // await fetch('/api/notifications/read-all', { method: 'POST' });
      
      setNotifications(prev =>
        prev.map(n => (n.isRead ? n : { ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Toggle notification panel
  const togglePanel = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Mark all as read when opening the panel
    if (newIsOpen && unreadCount > 0) {
      void markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current && 
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get appropriate icon for notification type
  const getNotificationIcon = useCallback((type: string): string => {
    switch (type) {
      case 'RESERVATION_CONFIRMATION':
      case 'RESERVATION_REMINDER':
        return '📅';
      case 'CHECK_IN_REMINDER':
      case 'CHECK_IN_CONFIRMATION':
        return '✅';
      case 'BOOK_DUE_REMINDER':
      case 'BOOK_OVERDUE':
        return '📚';
      case 'SYSTEM_ALERT':
        return '⚠️';
      default:
        return '🔔';
    }
  }, []);

  // Don't render if no user is logged in
  if (!userId) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id="notification-button"
        onClick={togglePanel}
        className={cn(
          "relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
          isOpen ? "bg-gray-100" : ""
        )}
        aria-label={`${unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id="notification-panel"
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="notification-button"
          tabIndex={-1}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                    disabled={unreadCount === 0}
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Close notifications"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 rounded bg-gray-200 w-3/4"></div>
                        <div className="h-3 rounded bg-gray-200"></div>
                        <div className="h-2 rounded bg-gray-200 w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <BellOff className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
                <p className="mt-1 text-xs text-gray-400">We'll notify you when something happens.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      "px-4 py-3 hover:bg-gray-50 cursor-pointer",
                      !notification.isRead ? "bg-blue-50" : ""
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <span className="text-xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 text-center">
              <a
                href="/notifications"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle view all notifications
                  console.log('View all notifications');
                }}
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
