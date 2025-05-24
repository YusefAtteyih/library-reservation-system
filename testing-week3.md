# How to Test Week 3 Features

This document provides instructions for testing the reservation and loan workflows implemented in Week 3 of the Bahçeşehir University Library Reservation System.

## Reservation Workflow Testing

### Backend API Testing

1. **Create Reservation**
   - Endpoint: `POST /api/reservations`
   - Request body:
     ```json
     {
       "userId": "user-id",
       "roomId": "room-id",  // Either roomId or seatId must be provided, but not both
       "timeslotId": "timeslot-id",
       "notes": "Optional notes"
     }
     ```
   - Expected response: Created reservation object with status `PENDING`, check-in code, and QR code URL
   - Test cases:
     - Create room reservation (valid)
     - Create seat reservation (valid)
     - Attempt to reserve both room and seat (should fail)
     - Attempt to reserve neither room nor seat (should fail)
     - Attempt to reserve a room/seat already reserved for the same timeslot (should fail)
     - Attempt to exceed daily reservation limit of 4 hours (should fail)

2. **Cancel Reservation**
   - Endpoint: `PATCH /api/reservations/{id}/cancel`
   - Request body:
     ```json
     {
       "userId": "user-id"
     }
     ```
   - Expected response: Updated reservation object with status `CANCELED`
   - Test cases:
     - Cancel own reservation (valid)
     - Attempt to cancel another user's reservation (should fail)
     - Attempt to cancel a reservation that has already started (should fail)

3. **Approve Reservation (Admin)**
   - Endpoint: `PATCH /api/reservations/{id}/approve`
   - Expected response: Updated reservation object with status `CONFIRMED`
   - Test cases:
     - Approve pending reservation (valid)
     - Attempt to approve non-pending reservation (should fail)

4. **Reject Reservation (Admin)**
   - Endpoint: `PATCH /api/reservations/{id}/reject`
   - Request body:
     ```json
     {
       "reason": "Optional rejection reason"
     }
     ```
   - Expected response: Updated reservation object with status `REJECTED`
   - Test cases:
     - Reject pending reservation (valid)
     - Attempt to reject non-pending reservation (should fail)

5. **Check-In**
   - Endpoint: `POST /api/reservations/check-in`
   - Request body:
     ```json
     {
       "checkInCode": "check-in-code"
     }
     ```
   - Expected response: Updated reservation object with status `CHECKED_IN`
   - Test cases:
     - Check in with valid code within valid time window (valid)
     - Attempt to check in with invalid code (should fail)
     - Attempt to check in too early (should fail)
     - Attempt to check in more than 15 minutes late (should result in `FORFEITED` status)

6. **Check-Out**
   - Endpoint: `PATCH /api/reservations/{id}/check-out`
   - Expected response: Updated reservation object with status `COMPLETED`
   - Test cases:
     - Check out from checked-in reservation (valid)
     - Attempt to check out from non-checked-in reservation (should fail)

### Loan Workflow Testing

1. **Borrow Book**
   - Endpoint: `POST /api/loans`
   - Request body:
     ```json
     {
       "userId": "user-id",
       "bookId": "book-id",
       "dueDate": "2023-12-31T23:59:59Z"  // Optional, defaults to 14 days from now
     }
     ```
   - Expected response: Created loan object with status `BORROWED` and book status updated to `ON_LOAN`
   - Test cases:
     - Borrow available book (valid)
     - Attempt to borrow unavailable book (should fail)
     - Attempt to borrow when user has overdue books (should fail)
     - Attempt to exceed maximum borrowed books limit (should fail)

2. **Return Book**
   - Endpoint: `PATCH /api/loans/{id}/return`
   - Expected response: Updated loan object with status `RETURNED` and book status updated to `AVAILABLE`
   - Test cases:
     - Return borrowed book (valid)
     - Attempt to return already returned book (should fail)

3. **Extend Loan**
   - Endpoint: `PATCH /api/loans/{id}/extend`
   - Request body:
     ```json
     {
       "days": 7  // Optional, defaults to 7 days
     }
     ```
   - Expected response: Updated loan object with extended due date and incremented extension count
   - Test cases:
     - Extend loan (valid)
     - Attempt to extend overdue loan (should fail)
     - Attempt to exceed maximum extensions (should fail)

4. **Join Waitlist**
   - Endpoint: `POST /api/loans/waitlist`
   - Request body:
     ```json
     {
       "userId": "user-id",
       "bookId": "book-id"
     }
     ```
   - Expected response: Created waitlist entry
   - Test cases:
     - Join waitlist for unavailable book (valid)
     - Attempt to join waitlist for available book (should fail)
     - Attempt to join waitlist twice for same book (should fail)

5. **Get Waitlist**
   - Endpoint: `GET /api/loans/waitlist/{bookId}`
   - Expected response: Array of waitlist entries for the specified book
   - Test cases:
     - Get waitlist for book with waitlist entries (valid)
     - Get waitlist for book without waitlist entries (should return empty array)

6. **Remove from Waitlist**
   - Endpoint: `DELETE /api/loans/waitlist/{id}`
   - Expected response: Deleted waitlist entry
   - Test cases:
     - Remove from waitlist (valid)
     - Attempt to remove non-existent waitlist entry (should fail)

## Frontend UI Testing

### Availability Calendar

1. **View Availability Calendar**
   - Navigate to `/availability`
   - Verify that the calendar is displayed with date selection
   - Verify that rooms and seats tabs are working
   - Verify that available time slots are displayed for each resource

2. **Filter Resources**
   - Test room filters (capacity, location)
   - Test seat filters (room)
   - Verify that filtered results are displayed correctly

3. **Make Reservation**
   - Click on an available time slot
   - Verify that you are redirected to the reservation form with pre-filled details
   - Complete and submit the form
   - Verify that you receive a success message and are redirected to your reservations

### Reservation Form

1. **Create New Reservation**
   - Navigate to `/reservations/new`
   - Fill out the form with valid data
   - Submit the form
   - Verify that you receive a success message and are redirected to your reservations

2. **Validation**
   - Test form validation for required fields
   - Test validation for conflicting reservations
   - Test validation for daily reservation limits

### My Reservations & Loans

1. **View Reservations**
   - Navigate to `/my-reservations`
   - Verify that your reservations are displayed with correct status
   - Test the tabs to switch between reservations, loans, and waitlist

2. **Cancel Reservation**
   - Find a pending or confirmed reservation
   - Click the "Cancel" button
   - Confirm the cancellation
   - Verify that the reservation status is updated to "CANCELED"

3. **Check-In**
   - Find a confirmed reservation
   - Click the "Check In" button
   - Verify that you are redirected to the check-in page

4. **View Loans**
   - Switch to the "Loans" tab
   - Verify that your borrowed books are displayed with correct status and due dates
   - Verify that overdue books are highlighted

5. **Return Book**
   - Find a borrowed book
   - Click the "Return" button
   - Confirm the return
   - Verify that the book status is updated

6. **Extend Loan**
   - Find a borrowed book that is not overdue
   - Click the "Extend" button
   - Verify that the due date is extended

7. **View Waitlist**
   - Switch to the "Waitlist" tab
   - Verify that your waitlisted books are displayed with position in line
   - Test removing yourself from a waitlist

### Check-In

1. **Check-In with Code**
   - Navigate to `/check-in`
   - Enter a valid check-in code
   - Verify that you receive a success message

2. **QR Code Scanning**
   - Navigate to `/check-in`
   - Click "Scan QR Code"
   - Scan a valid QR code (simulated in test environment)
   - Verify that you receive a success message

3. **Invalid Check-In**
   - Test with invalid check-in code
   - Test with expired check-in window
   - Verify appropriate error messages

## Integration Testing

1. **End-to-End Reservation Flow**
   - Create a reservation
   - Have an admin approve it
   - Check in to the reservation
   - Check out from the reservation
   - Verify all status changes are reflected correctly

2. **End-to-End Loan Flow**
   - Borrow a book
   - Extend the loan
   - Return the book
   - Verify book status changes are reflected correctly

3. **Waitlist to Loan Flow**
   - Join waitlist for a book
   - Have another user return the book
   - Verify notification is sent (when notification system is implemented)
   - Borrow the book
   - Verify waitlist position is updated for other users

## Automated Tests

The following automated tests have been implemented:

1. **Backend Unit Tests**
   - `ReservationsService` tests
   - `LoansService` tests

2. **Backend Integration Tests**
   - `reservation.e2e-spec.ts` - Tests the complete reservation workflow
   - `loan.e2e-spec.ts` - Tests the complete loan workflow

3. **Frontend Component Tests**
   - Tests for reservation and loan UI components

To run the automated tests:

```bash
# Backend unit tests
cd packages/backend
npm run test

# Backend e2e tests
cd packages/backend
npm run test:e2e

# Frontend component tests
cd packages/frontend
npm run test
```

## Known Limitations

1. QR code scanning in the frontend is currently simulated and would require a real camera in production.
2. Email notifications for reservation status changes and loan due dates are not yet implemented (coming in Week 4).
3. The frontend currently uses mock data; full API integration will be completed in subsequent iterations.
