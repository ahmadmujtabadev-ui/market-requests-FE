// components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import ls from 'localstorage-slim';
import { selectUser } from '@/redux/slices/userSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth/login' 
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { profile, isLoading } = useAppSelector(selectUser);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = ls.get('access_token', { decrypt: true });
        
        if (!token) {
          // No token found, redirect to login
          router.replace(redirectTo);
          return;
        }

        // If we have a token but no profile, verify the token
      
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace(redirectTo);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [dispatch, profile, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isChecking || isLoading) {

    console.log("this state is runnig")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};