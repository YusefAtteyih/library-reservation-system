# How to Test Week 4 Features

This document provides instructions for testing the admin dashboard, notification system, and reporting features implemented in Week 4 of the Bahçeşehir University Library Reservation System.

## Prerequisites

1. The application must be running locally with both frontend and backend services started
2. Test users with different roles must be available:
   - Admin user: admin@example.com / password123
   - Student user: student@example.com / password123

## 1. Admin Dashboard Testing

### 1.1 Admin Console Base Structure

1. Log in with admin credentials (admin@example.com / password123)
2. Navigate to `/admin` to access the admin dashboard
3. Verify the following components are visible:
   - Navigation sidebar with links to different admin sections
   - Overview cards showing key metrics (total rooms, seats, books, reservations)
   - Recent activity feed
   - Quick action buttons

### 1.2 Pending Approvals Queue

1. From the admin dashboard, click on "Pending Approvals" in the sidebar
2. Verify the pending reservations are displayed in a table format
3. Test the filter functionality:
   - Filter by date range
   - Filter by room/seat
   - Filter by student name
4. Test the approval workflow:
   - Click "Approve" on a pending reservation
   - Verify the reservation status changes to "Approved"
   - Verify a confirmation notification is sent to the student
5. Test the rejection workflow:
   - Click "Reject" on a pending reservation
   - Enter a reason for rejection in the modal
   - Verify the reservation status changes to "Rejected"
   - Verify a rejection notification is sent to the student

### 1.3 Real-time Occupancy Map

1. From the admin dashboard, click on "Occupancy Map" in the sidebar
2. Verify the heatmap visualization shows current room and seat occupancy
3. Test the real-time updates:
   - In another browser window, log in as a student
   - Make a new reservation and check in
   - Return to the admin occupancy map and verify it updates in real-time
4. Test the filtering options:
   - Filter by building/floor
   - Filter by time range
   - Filter by occupancy percentage

### 1.4 Bulk CSV Import for Books

1. From the admin dashboard, click on "Import" in the sidebar
2. Download the sample CSV template
3. Prepare a test CSV file with the following book data:
   ```
   ISBN,Title,Author,Publisher,PublicationYear,Quantity
   9780132350884,Clean Code,Robert C. Martin,Prentice Hall,2008,2
   9780201633610,Design Patterns,Erich Gamma,Addison-Wesley,1994,1
   ```
4. Upload the CSV file using the import form
5. Verify the import progress is displayed
6. Once complete, navigate to the Books section and verify the imported books are present

### 1.5 Manual Override for Reservations

1. From the admin dashboard, click on "Reservations" in the sidebar
2. Find an active reservation and click "Override"
3. Test the following override actions:
   - Extend reservation time
   - Change room/seat assignment
   - Force check-in
   - Cancel reservation
4. Verify each action is properly reflected in the system
5. Verify appropriate notifications are sent to affected students

## 2. Real-time Updates Testing

### 2.1 Socket.io Integration

1. Open browser developer tools and check the console for socket connection messages
2. Verify the socket connection is established successfully
3. Test real-time updates across multiple browser windows:
   - Make changes in one window (e.g., create a reservation)
   - Verify the changes appear in another window without refreshing

### 2.2 Availability Updates

1. Log in as a student and navigate to the room/seat availability calendar
2. In another browser window, log in as an admin
3. As admin, make changes to room/seat availability (e.g., block a timeslot)
4. Verify the student's calendar updates in real-time without refreshing

## 3. Notification System Testing

### 3.1 Backend Notification Service

This is primarily tested through the frontend notification display, but you can also verify in the database:

1. Connect to the database and check the `Notification` table
2. Verify notifications are being created for various system events:
   - Reservation confirmations
   - Check-in reminders
   - Overdue book notices
   - Waitlist notifications

### 3.2 Notification Triggers

Test each notification trigger by performing the associated action:

1. Create a reservation to trigger confirmation notifications
2. Create a reservation for tomorrow to trigger reminder notifications
3. Borrow a book and set its due date to today to trigger overdue notifications
4. Return a book with waitlist entries to trigger waitlist notifications

### 3.3 In-app Notifications

1. Log in as a student
2. Verify the notification bell icon is visible in the header
3. If there are unread notifications, verify a badge with the count is displayed
4. Click the notification bell to open the notification panel
5. Verify notifications are displayed with:
   - Title and message
   - Timestamp
   - Read/unread status
   - Action buttons where applicable
6. Test marking a single notification as read
7. Test marking all notifications as read
8. Verify the notification count updates correctly

### 3.4 Admin Notifications

1. Log in as an admin
2. Navigate to the admin dashboard
3. Verify admin-specific notifications are displayed:
   - Pending approval requests
   - System alerts
   - Resource maintenance notifications
4. Navigate to the full notifications page via "View All Notifications"
5. Test the filtering options:
   - Filter by notification type
   - Filter by date range
   - Filter by search query
6. Test the export functionality:
   - Click "Export" to download notifications as CSV
   - Verify the CSV file contains the correct data

## 4. Admin Reporting Testing

1. Log in as an admin
2. Navigate to "Reports" in the admin sidebar
3. Verify the following report sections are available:
   - Reservations
   - Book Loans
   - Users
4. Test the date range selector:
   - Change from "Last 7 Days" to other options
   - Verify the charts and data update accordingly
5. Test the export functionality:
   - Click "Export CSV" to download report data
   - Verify the CSV files contain the correct data
6. Verify all charts are interactive:
   - Hover over data points to see tooltips
   - Click on legend items to toggle data series

## 5. Performance and Accessibility Testing

### 5.1 Performance Testing

1. Open Chrome DevTools and navigate to the Lighthouse tab
2. Run a performance audit on key pages:
   - Home page
   - Reservation calendar
   - Admin dashboard
   - Reports page
3. Verify the performance score is 95+ for each page
4. Check that API response times are under 300ms (visible in Network tab)

### 5.2 Accessibility Testing

1. Run a Lighthouse accessibility audit on key pages
2. Verify the accessibility score is WCAG 2.1 AA compliant
3. Test keyboard navigation throughout the application
4. Test with screen reader software (e.g., NVDA, VoiceOver)
5. Verify proper color contrast for all UI elements
6. Verify all form inputs have proper labels and ARIA attributes

## Troubleshooting

If you encounter issues during testing:

1. Check the browser console for JavaScript errors
2. Check the backend logs for server errors
3. Verify the database connection is active
4. Ensure all environment variables are properly set
5. Clear browser cache and cookies if experiencing UI inconsistencies

For any persistent issues, please contact the development team with:
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or screen recordings if applicable
