import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/components';
import { useAppDispatch } from '@/hooks/hooks';
import { Form, Formik, FormikHelpers } from 'formik';
import Toast from '@/components/Toast';
import { authInitialValues } from '@/formik/utils';
import { FormikInput, FormikSubmitButton } from '@/formik/component';
import { ResetRequestSchema } from '@/validations/schemas';
import { userForgetRequestAsync } from '@/services/auth/asyncThunk';

interface ForgotPasswordData {
  email: string;
}

// RENAMED: This should be called ForgotPassword, not ResetPassword
const ResetPassword = () => {
  const [authError, setAuthError] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();

  const requestReset = async (userData: ForgotPasswordData) => {
    if (!userData.email) {
      throw new Error("Email is required");
    }

    try {
      const result = await dispatch(userForgetRequestAsync(userData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (
    values: ForgotPasswordData,
    formikHelpers: FormikHelpers<ForgotPasswordData>
  ) => {
    try {
      const result = await requestReset(values);

      Toast.fire({
        icon: "success",
        title: result?.message || 'Reset link sent successfully',
        text: 'Please check your email for the reset link',
      });

      formikHelpers.resetForm();
      formikHelpers.setSubmitting(false);
      setAuthError('');
    } catch (error) {
      console.error('Forgot password error:', error);

      if (error && typeof error === 'object' && 'message' in error) {
        setAuthError((error as { message: string }).message);
      } else {
        setAuthError('Failed to send reset link. Please try again.');
      }

      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="bg-white p-5 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {authError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {authError}
          </div>
        )}

        <Formik
          initialValues={authInitialValues.resetRequest}
          validationSchema={ResetRequestSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FormikInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email"
              />
              <FormikSubmitButton
                isSubmitting={isSubmitting}
                loadingText="Sending Reset Link..."
              >
                Send Reset Link
              </FormikSubmitButton>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-6 text-sm text-gray-600">
          Remember your password?
          <button
            onClick={() => router.push('/auth/login')}
            className="text-blue-600 underline font-bold ml-1"
          >
            Sign In here
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default ResetPassword;

// // ============================================
// // FILE 2: src/pages/auth/reset-password.tsx
// // (This is the NEW file I provided earlier)
// // ============================================

// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Eye, EyeOff } from 'lucide-react';
// import { PageContainer } from '@/components/ui/components';
// import { useAppDispatch } from '@/hooks/hooks';
// import Toast from '@/components/Toast';
// import { userResetPasswordAsync } from '@/services/auth/asyncThunk';

// const ResetPassword = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const dispatch = useAppDispatch();
  
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [token, setToken] = useState('');
//   const [formData, setFormData] = useState({
//     password: '',
//     confirmPassword: '',
//   });

//   useEffect(() => {
//     const tokenFromUrl = searchParams.get('token');
//     if (!tokenFromUrl) {
//       setError('Invalid or missing reset token');
//       Toast.fire({
//         icon: 'error',
//         title: 'Invalid Link',
//         text: 'This password reset link is invalid or has expired',
//       });
//     } else {
//       setToken(tokenFromUrl);
//     }
//   }, [searchParams]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     setError('');
//   };

//   const validateForm = () => {
//     if (!formData.password || formData.password.length < 8) {
//       setError('Password must be at least 8 characters long');
//       return false;
//     }
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!token) {
//       setError('Invalid reset token');
//       return;
//     }

//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);
//     setError('');

//     try {
//       const result = await dispatch(
//         userResetPasswordAsync({
//           token: token,
//           newPassword: formData.password,
//         })
//       ).unwrap();

//       Toast.fire({
//         icon: 'success',
//         title: 'Password Reset Successful!',
//         text: result?.message || 'You can now login with your new password',
//       });

//       setFormData({ password: '', confirmPassword: '' });

//       setTimeout(() => {
//         router.push('/auth/login');
//       }, 2000);

//     } catch (err: any) {
//       console.error('Reset password error:', err);
//       const errorMessage = err?.message || 'Failed to reset password. Please try again.';
      
//       setError(errorMessage);
//       Toast.fire({
//         icon: 'error',
//         title: 'Reset Failed',
//         text: errorMessage,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <PageContainer>
//       <div className="bg-white shadow-2xl p-8 w-full max-w-md rounded-lg">
//         <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
//           Create New Password
//         </h2>

//         {error && (
//           <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
//             {error}
//           </div>
//         )}

//         {!token && (
//           <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
//             Invalid or missing reset token. Please request a new password reset link.
//           </div>
//         )}

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               New Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 placeholder="Enter new password"
//                 className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//                 disabled={!token || isSubmitting}
//                 minLength={8}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//             <p className="text-xs text-gray-500 mt-1">
//               Must be at least 8 characters long
//             </p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Confirm Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showConfirmPassword ? 'text' : 'password'}
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 placeholder="Confirm new password"
//                 className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//                 disabled={!token || isSubmitting}
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
//             disabled={isSubmitting || !token}
//             className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
//           </button>
//         </div>

//         <div className="text-center mt-6 text-sm text-gray-600">
//           Remember your password?
//           <button
//             onClick={() => router.push('/auth/login')}
//             className="text-blue-600 underline font-medium ml-1"
//           >
//             Sign In here
//           </button>
//         </div>
//       </div>
//     </PageContainer>
//   );
// };

// export default ResetPassword;

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { PageContainer } from '@/components/ui/components';
// import { useAppDispatch } from '@/hooks/hooks';
// import { Form, Formik, FormikHelpers } from 'formik';

// import Toast from '@/components/Toast';
// import { authInitialValues } from '@/formik/utils';
// import { FormikInput, FormikSubmitButton } from '@/formik/component';
// import { ResetRequestSchema } from '@/validations/schemas';
// import { userForgetRequestAsync } from '@/services/auth/asyncThunk';

// // Define proper types
// interface ResetPasswordData {
//   email: string;
// }

// const ResetPassword = () => {
//   const [authError, setAuthError] = useState('');
//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   const resetPassword = async (userData: ResetPasswordData) => {
//     if (!userData.email) {
//       throw new Error("Email is required");
//     }

//     try {
//       const result = await dispatch(userForgetRequestAsync(userData)).unwrap();
//       return result;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const handleSubmit = async (
//     values: ResetPasswordData,
//     formikHelpers: FormikHelpers<ResetPasswordData>
//   ) => {
//     try {
//       const result = await resetPassword(values);

//       Toast.fire({
//         icon: "success",
//         title: result?.message || 'Reset link sent successfully',
//         text: 'Please check your email for the reset link',
//       });

//       formikHelpers.resetForm();
//       formikHelpers.setSubmitting(false);
//       setAuthError('');
//     } catch (error) {
//       console.error('Reset password error:', error);

//       if (error && typeof error === 'object' && 'message' in error) {
//         setAuthError((error as { message: string }).message);
//       } else {
//         setAuthError('Failed to send reset link. Please try again.');
//       }

//       formikHelpers.setSubmitting(false);
//     }
//   };

//   return (
//     <PageContainer>
//       <div className="bg-white p-5">
//         <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
//           Reset your password
//         </h2>

//         {authError && (
//           <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//             {authError}
//           </div>
//         )}

//         <Formik
//           initialValues={authInitialValues.resetRequest}
//           validationSchema={ResetRequestSchema}
//           onSubmit={handleSubmit}
//         >
//           {({ isSubmitting }) => (
//             <Form className="space-y-4">
//               <FormikInput
//                 label="Email Address"
//                 name="email"
//                 type="email"
//                 placeholder="Enter your email"
//               />
//               <FormikSubmitButton
//                 isSubmitting={isSubmitting}
//                 loadingText="Signing In..."
//               >
//                 Verify Email
//               </FormikSubmitButton>
//             </Form>
//           )}
//         </Formik>

//         <div className="text-center mt-6 text-sm text-gray-600">
//           Remember your password?
//           <button
//             onClick={() => router.push('/auth/login')}
//             className="text-blue-600 underline font-bold ml-1"
//           >
//             Sign In here
//           </button>
//         </div>
//       </div>
//     </PageContainer>
//   );
// };

// export default ResetPassword;