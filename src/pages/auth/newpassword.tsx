// src/pages/auth/newpassword.tsx (Redux Version)

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { PageContainer } from '@/components/ui/components';
import { useAppDispatch } from '@/hooks/hooks';
import Toast from '@/components/Toast';
import { userResetPasswordAsync } from '@/services/auth/asyncThunk';

const NewPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token');
      Toast.fire({
        icon: 'error',
        title: 'Invalid Link',
        text: 'This password reset link is invalid or has expired',
      });
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await dispatch(
        userResetPasswordAsync({
          token: token,
          newPassword: formData.password,
        })
      ).unwrap();

      Toast.fire({
        icon: 'success',
        title: 'Password Reset Successful!',
        text: result?.message || 'You can now login with your new password',
      });

      // Clear form
      setFormData({ password: '', confirmPassword: '' });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);

    } catch (err: any) {
      console.error('Reset password error:', err);
      const errorMessage = err?.message || 'Failed to reset password. Please try again.';
      
      setError(errorMessage);
      Toast.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="bg-white shadow-2xl p-8 w-full max-w-md rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Create New Password
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {!token && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
            Invalid or missing reset token. Please request a new password reset link.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!token || isSubmitting}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={!token || isSubmitting}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!token || isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={!token || isSubmitting}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !token}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          Remember your password?
          <button
            onClick={() => router.push('/auth/login')}
            className="text-blue-600 underline font-medium ml-1 hover:text-blue-800"
          >
            Sign In here
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default NewPassword;

// // src/pages/auth/newpassword.tsx

// import React, { useState } from 'react';
// import { Eye, EyeOff } from 'lucide-react';
// import { PageContainer } from '@/components/ui/components';

// const NewPassword = () => {
//   const [isLogin] = useState(true);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     role: 'tenant',
//     password: '',
//     confirmPassword: '',
//     agreeToTerms: false,
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('Form submitted:', formData);
//     // Optional: Use router.push('/auth/login') if you want to redirect
//   };

//   return (
//      <PageContainer
//           >
//       <div className="bg-white shadow-2xl p-8 w-[473px] h-[361px]">
//         <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
//           Create New Password
//         </h2>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-[16px] font-bold text-gray-700 mb-1">
//               New Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 placeholder="••••••••"
//                 className="w-full px-3 py-2.5 text-[18px] font-bold border border-gray-200 focus:outline-none text-[#BABABA]"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           <div>
//             <label className="block text-[16px] font-bold text-gray-700 mb-1">
//               Confirm Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showConfirmPassword ? 'text' : 'password'}
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 placeholder="••••••••"
//                 className="w-full px-3 py-2.5 text-[18px] font-bold border border-gray-200 focus:outline-none text-[#BABABA]"
//                 required={!isLogin}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//               >
//                 {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           <button
//             onClick={handleSubmit}
//             className="text-[16px] w-full bg-blue-600 text-white py-3 px-4 font-medium hover:bg-blue-700 transition-colors"
//           >
//             Login
//           </button>
//         </div>
//       </div>
//     </PageContainer>
//   );
// };

// export default NewPassword;
