export { AuthLayout } from '../layouts/authLayout';
export { DashboardLayout } from '../layouts/dashboardLayout';
export { PublicLayout } from '../layouts/publicLayout';
export { ProtectedRoute } from '../layouts/protectedRoutes';
export { PublicRoute } from '../layouts/publicRoute';

// HOC approach (alternative)
// utils/withAuth.tsx
import { ComponentType } from 'react';
import { ProtectedRoute } from '../layouts/protectedRoutes';

export function withAuth<T extends object>(Component: ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}