import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './components/theme-provider';
// Using a simple toast implementation for now
const ToastContainer = () => <div id="toast-container" className="fixed bottom-4 right-4 z-50" />;
import { AuthProvider } from './contexts/auth-context';
import { LoadingSpinner } from './components/loading-spinner';
// Simple error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div role="alert" className="p-4 bg-red-100 text-red-700 rounded">
    <p>Something went wrong:</p>
    <pre className="whitespace-pre-wrap">{error.message}</pre>
    <button 
      onClick={resetErrorBoundary}
      className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Try again
    </button>
  </div>
);
import { ProtectedRoute } from './components/protected-route';
import { Layout } from './layouts/layout';

// Lazy load pages
// Placeholder components for routes
const Placeholder = ({ name }: { name: string }) => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">{name} Page</h1>
    <p>This is a placeholder for the {name.toLowerCase()} page.</p>
  </div>
);

// Lazy load pages with error boundaries
const Home = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Home" /> }));
const Login = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Login" /> }));
const Register = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Register" /> }));
const Books = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Books" /> }));
const BookDetails = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Book Details" /> }));
const Rooms = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Rooms" /> }));
const RoomDetails = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Room Details" /> }));
const Reservations = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Reservations" /> }));
const Loans = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Loans" /> }));
const Profile = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Profile" /> }));
const AdminDashboard = React.lazy(() => Promise.resolve({ default: () => <Placeholder name="Admin Dashboard" /> }));
const NotFound = React.lazy(() => Promise.resolve({ default: () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl">Page not found</p>
    </div>
  </div>
)}));

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="library-theme">
      <HelmetProvider>
        <AuthProvider>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={({ error, resetErrorBoundary }) => (
                  <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
                )}
              >
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="books" element={<Books />} />
                      <Route path="books/:id" element={<BookDetails />} />
                      <Route path="rooms" element={<Rooms />} />
                      <Route path="rooms/:id" element={<RoomDetails />} />
                      
                      {/* Protected routes */}
                      <Route path="reservations" element={
                        <ProtectedRoute>
                          <Reservations />
                        </ProtectedRoute>
                      } />
                      <Route path="loans" element={
                        <ProtectedRoute>
                          <Loans />
                        </ProtectedRoute>
                      } />
                      <Route path="profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />

                      {/* Admin routes */}
                      <Route path="admin" element={
                        <ProtectedRoute requiredRole="ADMIN">
                          <AdminDashboard />
                        </ProtectedRoute>
                      } />

                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
                <ToastContainer />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </AuthProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
