import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ls from 'localstorage-slim';
import { fetchUserMeAsync } from '@/services/auth/asyncThunk';
import { selectUser, userLogout } from '@/redux/slices/userSlice';
import { useAppDispatch, useAppSelector } from './hooks';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { profile, isLoading, isAuthenticated } = useAppSelector(selectUser);
  console.log("profile in use auth", profile)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = ls.get('access_token', { decrypt: true });
      if (token) {
        try {
          await dispatch(fetchUserMeAsync()).unwrap();
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };

    initializeAuth();
  }, [dispatch, profile, router]);

  return {
    isLoading,
    isAuthenticated,
  };
};

export default useAuth;