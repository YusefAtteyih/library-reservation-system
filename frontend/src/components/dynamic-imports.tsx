/**
 * Dynamic imports for code splitting
 * This file provides lazy-loaded components for the application
 */
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingSpinner } from '../components/loading-spinner';

// Admin components
export const AdminDashboard = dynamic(
  () => import('@/app/admin/page').then(mod => mod),
  {
    loading: () => (
      <Suspense fallback={<LoadingSpinner fullScreen />} />
    ),
    ssr: false
  }
);

export const AdminApprovals = dynamic(
  () => import('@/app/admin/approvals/page').then(mod => mod),
  {
    loading: () => (
      <Suspense fallback={<LoadingSpinner fullScreen />} />
    ),
    ssr: false
  }
);

export const AdminOccupancy = dynamic(
  () => import('@/app/admin/occupancy/page').then(mod => mod),
  {
    loading: () => (
      <Suspense fallback={<LoadingSpinner fullScreen />} />
    ),
    ssr: false
  }
);

export const AdminReports = dynamic(
  () => import('@/app/admin/reports/page').then(mod => mod),
  {
    loading: () => (
      <Suspense fallback={<LoadingSpinner fullScreen />} />
    ),
    ssr: false
  }
);

// User components
export const RoomsPage = dynamic(
  () => import('@/app/rooms/page').then(mod => mod),
  {
    loading: () => (
      <Suspense fallback={<LoadingSpinner fullScreen />} />
    ),
    ssr: true
  }
);

export const SeatsPage = dynamic(
  () => import('@/app/seats/page').then(mod => mod),
  {
    loading: () => (
      <Suspense fallback={<LoadingSpinner fullScreen />} />
    ),
    ssr: true
  }
);

export const BooksPage = dynamic(
  () => import('@/app/books/page').then(mod => mod),
  {
    loading: () => (
      <Suspense fallback={<LoadingSpinner fullScreen />} />
    ),
    ssr: true
  }
);

export const ReservationsPage = dynamic(
  () => import('@/app/my-reservations/page').then(mod => mod),
  {
    loading: () => (
      <Suspense fallback={<LoadingSpinner fullScreen />} />
    ),
    ssr: true
  }
);

export const NotificationPanel = dynamic(
  () => import('@/components/notification-panel').then(mod => mod),
  {
    loading: () => (
      <Suspense fallback={<LoadingSpinner fullScreen />} />
    ),
    ssr: false
  }
);
