"use client";

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationPanel } from './notification-panel';
import { useSession } from 'next-auth/react';
import { useSocket } from '../socket-provider';

// Mock the next-auth and socket hooks
jest.mock('next-auth/react');
jest.mock('../socket-provider');

describe('NotificationPanel', () => {
  // Setup mock data and functions
  const mockSession = {
    user: { id: 'user1', name: 'Test User', email: 'test@example.com', role: 'STUDENT' }
  };
  
  const mockSubscribeToNotifications = jest.fn();
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (useSession as jest.Mock).mockReturnValue({ data: { session: mockSession } });
    (useSocket as jest.Mock).mockReturnValue({ 
      subscribeToNotifications: mockSubscribeToNotifications 
    });
    
    // Mock subscription function
    mockSubscribeToNotifications.mockReturnValue(() => {});
  });
  
  it('renders the notification bell icon', () => {
    render(<NotificationPanel />);
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    expect(bellButton).toBeInTheDocument();
  });
  
  it('shows unread count badge when there are unread notifications', async () => {
    render(<NotificationPanel />);
    
    // Wait for the mock data to load
    await waitFor(() => {
      const unreadBadge = screen.getByText('2');
      expect(unreadBadge).toBeInTheDocument();
    });
  });
  
  it('opens notification panel when bell is clicked', async () => {
    render(<NotificationPanel />);
    
    // Click the bell icon
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    // Check if panel is open
    await waitFor(() => {
      const panelTitle = screen.getByText('Notifications');
      expect(panelTitle).toBeInTheDocument();
    });
  });
  
  it('displays notification items when panel is open', async () => {
    render(<NotificationPanel />);
    
    // Click the bell icon
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    // Check if notifications are displayed
    await waitFor(() => {
      const notification1 = screen.getByText('Reservation Confirmed');
      const notification2 = screen.getByText('Check-in Required Soon');
      expect(notification1).toBeInTheDocument();
      expect(notification2).toBeInTheDocument();
    });
  });
  
  it('marks a notification as read when "Mark as read" is clicked', async () => {
    render(<NotificationPanel />);
    
    // Click the bell icon
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    // Find and click the "Mark as read" button for the first notification
    await waitFor(() => {
      const markAsReadButtons = screen.getAllByText('Mark as read');
      fireEvent.click(markAsReadButtons[0]);
    });
    
    // Check if unread count is updated
    await waitFor(() => {
      const unreadBadge = screen.getByText('1');
      expect(unreadBadge).toBeInTheDocument();
    });
  });
  
  it('marks all notifications as read when "Mark all as read" is clicked', async () => {
    render(<NotificationPanel />);
    
    // Click the bell icon
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    // Find and click the "Mark all as read" button
    await waitFor(() => {
      const markAllAsReadButton = screen.getByText('Mark all as read');
      fireEvent.click(markAllAsReadButton);
    });
    
    // Check if unread count is updated (should be 0, so badge should be gone)
    await waitFor(() => {
      const bellOffIcon = screen.getByRole('button', { name: /notifications/i });
      expect(bellOffIcon).toBeInTheDocument();
      
      // Unread badge should not be present
      const unreadBadge = screen.queryByText(/[0-9]+/);
      expect(unreadBadge).not.toBeInTheDocument();
    });
  });
  
  it('subscribes to real-time notifications when mounted', () => {
    render(<NotificationPanel />);
    expect(mockSubscribeToNotifications).toHaveBeenCalled();
  });
  
  it('adds new notifications when they are received in real-time', async () => {
    // Setup mock to simulate a new notification being received
    let notificationCallback: (notification: any) => void;
    mockSubscribeToNotifications.mockImplementation((callback) => {
      notificationCallback = callback;
      return () => {};
    });
    
    render(<NotificationPanel />);
    
    // Click the bell icon to open the panel
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    
    // Simulate receiving a new notification
    const newNotification = {
      id: '4',
      type: 'BOOK_BORROWED',
      title: 'Book Borrowed',
      message: 'You have borrowed "Clean Code"',
      isRead: false,
      createdAt: new Date(),
    };
    
    // Wait for initial notifications to load
    await waitFor(() => {
      expect(screen.getByText('Reservation Confirmed')).toBeInTheDocument();
    });
    
    // Trigger the notification callback
    notificationCallback(newNotification);
    
    // Check if the new notification is displayed
    await waitFor(() => {
      expect(screen.getByText('Book Borrowed')).toBeInTheDocument();
      expect(screen.getByText('You have borrowed "Clean Code"')).toBeInTheDocument();
    });
    
    // Check if unread count is updated
    await waitFor(() => {
      const unreadBadge = screen.getByText('3');
      expect(unreadBadge).toBeInTheDocument();
    });
  });
  
  it('does not render when user is not logged in', () => {
    // Mock no session
    (useSession as jest.Mock).mockReturnValue({ data: null });
    
    render(<NotificationPanel />);
    
    // Bell button should not be rendered
    const bellButton = screen.queryByRole('button', { name: /notifications/i });
    expect(bellButton).not.toBeInTheDocument();
  });
});
