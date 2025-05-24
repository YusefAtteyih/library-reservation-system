import React, { Suspense } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * LazyLoad component for wrapping dynamically imported components
 * Provides a standardized way to handle loading states
 */
export function LazyLoad({ children, fallback }: LazyLoadProps) {
  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      {children}
    </Suspense>
  );
}

/**
 * Default loading fallback component
 * Shows a simple loading spinner with accessible text
 */
function DefaultLoadingFallback() {
  return (
    <div className="flex justify-center items-center p-4" aria-live="polite">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
