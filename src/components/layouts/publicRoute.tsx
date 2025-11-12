
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import ls from 'localstorage-slim';
import { selectUser } from '@/redux/slices/userSlice';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
}) => {
  const router = useRouter();
  const { profile } = useSelector(selectUser);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = ls.get('access_token', { decrypt: true });
      
      if (token && profile?.id) {
        return;
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [profile, router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};