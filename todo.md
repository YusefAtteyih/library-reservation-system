# Library Reservation App - ToDo

This file tracks the progress of building the full-stack library reservation web application.

## Milestones & Tasks

**Week 1: Project Scaffold, Auth Flow, ERD Finalized**
- [x] 1.1 Set up project monorepo structure (`library-app` with `packages/frontend` and `packages/backend`).
- [x] 1.2 Initialize Git repository.
- [x] 1.3 Install Node.js, pnpm, TypeScript, ESLint, Prettier.
- [x] 1.4 Set up Next.js frontend (`packages/frontend`) with TypeScript, Tailwind CSS, Headless UI.
- [x] 1.5 Set up Node.js (NestJS) backend (`packages/backend`) with TypeScript.
- [x] 1.6 Set up Prisma ORM in the backend, connect to PostgreSQL (requires Docker setup or connection string).
- [x] 1.7 Define Prisma schema based on requirements (`schema.prisma`).
- [x] 1.8 Generate initial Prisma migration.
- [x] 1.9 Create ER diagram (Mermaid) in `docs/erd.md`.
- [x] 1.10 Create seed data scripts (`seed.ts`).
- [x] 1.11 Set up NextAuth.js in the frontend.
- [x] 1.12 Implement basic mock authentication flow (login endpoint placeholder).
- [x] 1.13 Implement basic role handling (STUDENT, ADMIN).
- [x] 1.14 Write "How to test" for Week 1 features.

**Week 2: Core CRUD for Rooms/Seats/Books + Basic UI**
- [x] 2.1 Implement backend API endpoints for Room CRUD.
- [x] 2.2 Implement backend API endpoints for Seat CRUD.
- [x] 2.3 Implement backend API endpoints for Book CRUD (including search).
- [x] 2.4 Implement frontend pages/components for displaying Rooms.
- [x] 2.5 Implement frontend pages/components for displaying Seats.
- [x] 2.6 Implement frontend pages/components for displaying Books (including search).
- [x] 2.7 Integrate SWR/React-Query for data fetching in frontend.
- [x] 2.8 Apply basic styling with Tailwind CSS/Headless UI.
- [x] 2.9 Write unit tests for backend CRUD services.
- [x] 2.10 Write basic frontend component tests.
- [x] 2.11 Write "How to test" for Week 2 features.

**Week 3: Reservation and Loan Workflows, Conflict Detection, QR Check-in**
- [x] 3.1 Implement backend API endpoint for creating reservations (students).
- [x] 3.2 Implement backend API endpoint for canceling reservations (students).
- [x] 3.3 Implement backend API endpoint for approving/declining reservations (admins).
- [x] 3.4 Implement backend API endpoint for checking out books (loans).
- [x] 3.5 Implement backend API endpoint for returning books (loans).
- [x] 3.6 Implement reservation conflict detection logic.
- [x] 3.7 Implement QR code generation logic (e.g., using a library).
- [x] 3.8 Implement check-in logic (backend endpoint to validate QR/time).
- [x] 3.9 Implement frontend UI for browsing room/seat availability (calendar view).
- [x] 3.10 Implement frontend UI for making reservations.
- [x] 3.11 Implement frontend UI for viewing "My Reservations & Loans".
- [x] 3.12 Implement frontend UI for check-in (simulated QR scan/button).
- [x] 3.13 Write integration tests for reservation/loan workflows.
- [x] 3.14 Write "How to test" for Week 3 features.

**Week 4: Admin Dashboards, Notifications, Unit & Integration Tests**
- [x] 4.1 Implement Admin Console UI base structure.
- [x] 4.2 Implement pending approvals queue UI with filters.
- [x] 4.3 Implement real-time occupancy map UI (placeholder/basic heatmap).
- [x] 4.4 Implement bulk CSV import for books (backend endpoint + UI).
- [x] 4.5 Implement manual override for reservations (backend endpoint + UI).
- [x] 4.6 Set up real-time framework (Socket.io/Pusher) for availability updates (backend + frontend integration).
- [x] 4.7 Implement notification system structure (backend service, DB model update).
- [x] 4.8 Implement notification triggers (confirmations, reminders, etc. - placeholders).
- [x] 4.9 Implement frontend display for in-app notifications.
- [x] 4.10 Increase test coverage (Jest, RTL, Supertest) towards 80% target.
- [x] 4.11 Write "How to test" for Week 4 features.

**Week 5: Accessibility Pass, Performance Tuning, Deployment Scripts**
- [x] 5.1 Conduct accessibility review and implement fixes (WCAG 2.1 AA).
- [x] 5.2 Perform frontend performance analysis (Lighthouse) and optimize.
- [ ] 5.3 Perform backend API performance analysis and optimize (P95 < 300ms target).
- [ ] 5.4 Implement security measures (OWASP Top-10 checks, rate limiting placeholders, 2FA setup for admins).
- [ ] 5.5 Set up logging (Winston) in the backend.
- [ ] 5.6 Set up monitoring placeholders (Prometheus/Grafana integration points).
- [ ] 5.7 Create Dockerfile for frontend.
- [ ] 5.8 Create Dockerfile for backend.
- [ ] 5.9 Create `docker-compose.yml` for local development (including PostgreSQL).
- [ ] 5.10 Create basic CI/CD pipeline configuration (e.g., `.github/workflows/ci.yml`).
- [ ] 5.11 Write "How to test" for Week 5 features.

**Week 6: UAT, Documentation, Handoff**
- [ ] 6.1 Simulate User Acceptance Testing (UAT) and gather feedback.
- [ ] 6.2 Address UAT feedback and make final adjustments.
- [ ] 6.3 Generate OpenAPI (Swagger) documentation (`docs/swagger.json`).
- [ ] 6.4 Create Storybook for UI components.
- [ ] 6.5 Finalize README.md with comprehensive setup, run, and deployment instructions.
- [ ] 6.6 Ensure all code is linted, formatted, and tests pass.
- [ ] 6.7 Package final application code.
- [ ] 6.8 Prepare final report/summary message.


