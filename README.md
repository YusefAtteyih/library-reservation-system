# Library Reservation System

A modern, full-stack application for managing library resources including books, rooms, and seats. Updated for Git push test.

## Features

- **User Authentication**
  - Role-based access control (Student, Admin)
  - JWT-based authentication
  - Secure password hashing

- **Resource Management**
  - Book catalog with availability tracking
  - Room and seat reservations
  - Real-time availability

- **User Dashboard**
  - View and manage reservations
  - Check due dates
  - Receive notifications

- **Admin Panel**
  - Manage users
  - Add/remove resources
  - View system analytics

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Query
- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL
- **Testing**: Jest, React Testing Library, Supertest
- **DevOps**: Docker, GitHub Actions

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- pnpm (recommended) or npm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/library-reservation-system.git
cd library-reservation-system
```

### 2. Install dependencies

```bash
# Install root dependencies
pnpm install

# Install backend dependencies
cd backend && pnpm install

# Install frontend dependencies
cd ../frontend && pnpm install
```

### 3. Set up environment variables

Create `.env` files in both `backend` and `frontend` directories:

```bash
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/library_db"
JWT_SECRET="your-jwt-secret"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

```bash
# frontend/.env
VITE_API_BASE_URL="http://localhost:3001/api"
```

### 4. Start the development environment

```bash
# Start database and services
docker-compose up -d

# In separate terminals:
cd backend && pnpm run start:dev
cd frontend && pnpm run dev
```

## Available Scripts

### Root
- `pnpm install` - Install all dependencies
- `pnpm start` - Start both frontend and backend in development mode
- `pnpm build` - Build both frontend and backend for production
- `pnpm test` - Run tests for both frontend and backend

### Backend
- `pnpm start:dev` - Start in development mode with hot-reload
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio for database management

### Frontend
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests

## Project Structure

```
.
├── backend/           # NestJS backend
│   ├── src/           # Source code
│   ├── test/          # Tests
│   └── prisma/        # Database schema and migrations
├── frontend/          # React frontend
│   ├── public/        # Static files
│   └── src/           # Source code
├── docker/            # Docker configurations
└── scripts/           # Utility scripts
```

## License

This project is licensed under the UNLICENSED license.
