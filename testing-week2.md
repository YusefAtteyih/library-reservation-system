# How to Test Week 2 Features

This document provides instructions for testing the core CRUD functionality implemented in Week 2 of the Bahçeşehir University Library Reservation System.

## Backend API Testing

### Room Management API

1. **List All Rooms**
   - Endpoint: `GET /api/rooms`
   - Expected response: Array of room objects with pagination
   - Test with query parameters: `?name=Study&location=Floor`

2. **Get Room Details**
   - Endpoint: `GET /api/rooms/{id}`
   - Expected response: Single room object with seats and timeslots
   - Test with valid and invalid IDs

3. **Create Room (Admin Only)**
   - Endpoint: `POST /api/rooms`
   - Request body:
     ```json
     {
       "name": "New Test Room",
       "location": "Library 4th Floor",
       "capacity": 12
     }
     ```
   - Expected response: Created room object

4. **Update Room (Admin Only)**
   - Endpoint: `PATCH /api/rooms/{id}`
   - Request body:
     ```json
     {
       "name": "Updated Room Name",
       "capacity": 15
     }
     ```
   - Expected response: Updated room object

5. **Delete Room (Admin Only)**
   - Endpoint: `DELETE /api/rooms/{id}`
   - Expected response: Deleted room object

### Seat Management API

1. **List All Seats**
   - Endpoint: `GET /api/seats`
   - Expected response: Array of seat objects with pagination
   - Test with query parameters: `?roomId={roomId}`

2. **Get Seats by Room**
   - Endpoint: `GET /api/seats/room/{roomId}`
   - Expected response: Array of seats in the specified room

3. **Get Seat Details**
   - Endpoint: `GET /api/seats/{id}`
   - Expected response: Single seat object with room and reservation details

4. **Create Seat (Admin Only)**
   - Endpoint: `POST /api/seats`
   - Request body:
     ```json
     {
       "label": "C5",
       "room": {
         "connect": { "id": "room-id-here" }
       }
     }
     ```
   - Expected response: Created seat object

5. **Update Seat (Admin Only)**
   - Endpoint: `PATCH /api/seats/{id}`
   - Request body:
     ```json
     {
       "label": "Updated Label"
     }
     ```
   - Expected response: Updated seat object

6. **Delete Seat (Admin Only)**
   - Endpoint: `DELETE /api/seats/{id}`
   - Expected response: Deleted seat object

### Book Management API

1. **List All Books**
   - Endpoint: `GET /api/books`
   - Expected response: Array of book objects with pagination
   - Test with query parameters: `?title=Algorithm&status=AVAILABLE`

2. **Search Books**
   - Endpoint: `GET /api/books/search?q={query}`
   - Expected response: Array of books matching the search query
   - Test with various search terms (title, author, ISBN)

3. **Get Book Details**
   - Endpoint: `GET /api/books/{id}`
   - Expected response: Single book object with loan details

4. **Create Book (Admin Only)**
   - Endpoint: `POST /api/books`
   - Request body:
     ```json
     {
       "isbn": "9781234567890",
       "title": "New Test Book",
       "author": "Test Author",
       "year": 2025,
       "status": "AVAILABLE"
     }
     ```
   - Expected response: Created book object

5. **Update Book (Admin Only)**
   - Endpoint: `PATCH /api/books/{id}`
   - Request body:
     ```json
     {
       "title": "Updated Book Title",
       "year": 2024
     }
     ```
   - Expected response: Updated book object

6. **Update Book Status (Admin Only)**
   - Endpoint: `PATCH /api/books/{id}/status`
   - Request body:
     ```json
     {
       "status": "ON_LOAN"
     }
     ```
   - Expected response: Updated book object with new status

7. **Delete Book (Admin Only)**
   - Endpoint: `DELETE /api/books/{id}`
   - Expected response: Deleted book object

## Frontend Testing

### Room Management UI

1. **View Rooms List**
   - Navigate to `/rooms`
   - Verify that room cards are displayed with name, location, and capacity
   - Verify that "View Details" link is available for all users
   - Verify that "Reserve" link is available for students
   - Verify that "Edit" and "Delete" options are available for admins only

2. **Room Details View**
   - Navigate to `/rooms/{id}`
   - Verify that room details are displayed correctly
   - Verify that seat list for the room is displayed
   - Verify that available timeslots are shown

3. **Room Management (Admin Only)**
   - Verify that "Add New Room" button is visible for admins
   - Test room creation form with valid and invalid inputs
   - Test room editing functionality
   - Test room deletion with confirmation dialog

### Seat Management UI

1. **View Seats List**
   - Navigate to `/seats`
   - Verify that seat table is displayed with label and location
   - Verify that "View" link is available for all users
   - Verify that "Reserve" link is available for students
   - Verify that "Edit" and "Delete" options are available for admins only

2. **Seat Details View**
   - Navigate to `/seats/{id}`
   - Verify that seat details are displayed correctly
   - Verify that room information is shown if the seat is in a room
   - Verify that reservation history is displayed

3. **Seat Management (Admin Only)**
   - Verify that "Add New Seat" button is visible for admins
   - Test seat creation form with valid and invalid inputs
   - Test seat editing functionality
   - Test seat deletion with confirmation dialog

### Book Management UI

1. **View Books List**
   - Navigate to `/books`
   - Verify that book table is displayed with title, author, ISBN, and status
   - Verify that "View" link is available for all users
   - Verify that "Borrow" link is available for students for AVAILABLE books
   - Verify that "Join Waitlist" link is available for non-available books
   - Verify that "Edit" and "Delete" options are available for admins only

2. **Book Search Functionality**
   - Test search input with various queries (title, author, ISBN)
   - Verify that results are filtered correctly
   - Verify that empty search shows all books

3. **Book Details View**
   - Navigate to `/books/{id}`
   - Verify that book details are displayed correctly
   - Verify that loan history is shown
   - Verify that current status is prominently displayed

4. **Book Management (Admin Only)**
   - Verify that "Add New Book" button is visible for admins
   - Test book creation form with valid and invalid inputs
   - Test book editing functionality
   - Test book status update functionality
   - Test book deletion with confirmation dialog

## Data Fetching and State Management

1. **API Integration**
   - Verify that SWR hooks are correctly fetching data from the API
   - Test loading states are displayed during data fetching
   - Test error handling when API requests fail
   - Verify that data is refreshed appropriately

2. **Role-Based Access Control**
   - Verify that admin-only actions are hidden from student users
   - Verify that student-only actions are appropriately displayed
   - Test unauthorized access attempts to admin endpoints

## Notes for Future Implementation

- The current implementation uses mock data in the frontend for development
- In the next phase, the frontend will be fully connected to the backend API
- Reservation and loan workflows will be implemented in Week 3
- QR code check-in functionality will be added in Week 3
