# How to Test Week 1 Features

This document provides instructions for testing the features implemented in Week 1 of the Bahçeşehir University Library Reservation System.

## Project Setup and Database

1. **Verify Project Structure**
   - The project follows a monorepo structure with separate packages for frontend and backend
   - Frontend uses Next.js with TypeScript and Tailwind CSS
   - Backend uses NestJS with TypeScript and Prisma ORM

2. **Database Schema and Migrations**
   - The database schema is defined in `packages/backend/prisma/schema.prisma`
   - Initial migration has been applied and can be found in `packages/backend/prisma/migrations`
   - ER diagram is available in `docs/erd.md`

3. **Seed Data**
   - Sample data for development has been loaded into the database
   - To reset and reload seed data, run: `cd packages/backend && pnpm run prisma:seed`

## Authentication System

1. **Login as Student**
   - Navigate to `/auth/signin` in the frontend
   - Enter student credentials: `STU001` / `student1`
   - You should be redirected to the dashboard with STUDENT role displayed
   - The dashboard should show student-specific options (Reserve a Room, Reserve a Seat, etc.)

2. **Login as Admin**
   - Navigate to `/auth/signin` in the frontend
   - Enter admin credentials: `ADMIN001` / `admin`
   - You should be redirected to the dashboard with ADMIN role displayed
   - The dashboard should show admin-specific options (Room Management, Book Management, etc.)

3. **Session Persistence**
   - After logging in, refresh the page
   - Your session should persist and you should remain on the dashboard
   - Your role (STUDENT or ADMIN) should still be displayed correctly

4. **Logout Functionality**
   - Click the "Sign out" button in the dashboard header
   - You should be redirected to the login page
   - Attempting to access the dashboard without logging in should redirect to the login page

## Notes for Future Implementation

- The current authentication system uses a mock implementation for development
- In production, this would be replaced with OAuth2/SAML integration with university SSO
- The dashboard links are currently placeholders and will be implemented in subsequent weeks
