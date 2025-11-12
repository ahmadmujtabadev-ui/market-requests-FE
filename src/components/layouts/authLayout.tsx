// components/layouts/AuthLayout.tsx
import { PublicRoute } from '../layouts/publicRoute';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <PublicRoute>
            {children}
    </PublicRoute>
  );
};