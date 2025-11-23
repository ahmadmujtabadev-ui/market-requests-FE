import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Formik, Form } from 'formik';
import { useAppDispatch } from '@/hooks/hooks';
import { FormikHelpers } from 'formik';
import { LoginSchema } from '../../validations/schemas';
import { FormikInput, FormikPasswordInput, FormikCheckbox, FormikSubmitButton } from '../../formik/component';
import { authInitialValues, createFormSubmissionHandler } from '../../formik/utils';
import { userSignInAsync } from '@/services/auth/asyncThunk';
import Toast from '@/components/Toast';
import { AuthLayout } from '@/components/layouts';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'], weight: ['300', '800'] });

interface LoginUserData extends Record<string, unknown> {
  email: string;
  password: string;
  agreeToTerms: boolean;
}

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginResponse {
  message: string;
  success: boolean;
  user: UserData,
  data?: {
    user: UserData;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
}

const Login = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const togglePasswordVisibility = () => setShowPassword((s) => !s);

  const handleGoogleAuth = async () => {
    // wire up later
    console.log('Google authentication clicked');
  };

  const loginUser = async (userData: Partial<LoginUserData>) => {
    if (!userData.email || !userData.password) throw new Error('Email and password are required');
    return await dispatch(userSignInAsync(userData as LoginUserData)).unwrap();
  };

  const handleLoginSuccess = (response: unknown, formikActions: FormikHelpers<LoginUserData>) => {
    const loginResponse = response as LoginResponse;
    Toast.fire({
      icon: 'success',
      title: loginResponse.message || 'Login successful',
      text: 'Welcome back User',
    });
    formikActions.setSubmitting(false);
    formikActions.resetForm();
    console.log("role", loginResponse)
    if (loginResponse?.user.role === "agent") {
      router.push('/dashboard/agent/overview');
    }
    if (loginResponse?.user.role === "admin"
    ) {
      router.push('/dashboard/admin/stat');

    }
    if (loginResponse?.user.role === "va") {
      router.push('/dashboard/vs/requestque');
    }
  };

  const handleLoginError = (error: unknown) => {
    setAuthError(
      error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Login failed. Please check your credentials.'
    );
  };

  const handleSubmit = createFormSubmissionHandler<LoginUserData>(
    loginUser,
    handleLoginSuccess,
    handleLoginError
  );

  return (
    <AuthLayout>
      {/* Split layout identical to Sign Up: left = brand panel, right = form panel */}
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* LEFT PANEL (image + gradient + logo) */}
        <div
          className="relative hidden md:flex items-center justify-center p-10"
          style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)' }}
        >
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            {/* Optional overlay image; update path or remove if not needed */}
            <img
              src="/logo.png"
              alt=""
              className="h-full w-full object-cover mix-blend-overlay"
            />
          </div>

          <div className="relative z-10 w-full max-w-md text-center text-white">
            <div className="flex justify-center mb-10">
              <img src="/logo.png" alt="One West Group" className="h-20 max-w-[280px]" />
            </div>
            <h2 className={`${manrope.className} text-4xl font-extrabold tracking-tight`}>
              Welcome Back
            </h2>
            <p className="mt-4 text-slate-300">
              Sign in to continue to your dashboard.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL (form card) */}
        <div className="flex items-center justify-center bg-[#EEEEEE] p-6 md:p-10">
          <div className="w-full max-w-md">
            {/* Mobile logo (since left panel is hidden on mobile) */}
            <div className="md:hidden flex justify-center mb-8">
              <img src="/logo.png" alt="One West Group" className="h-16 max-w-[240px]" />
            </div>

            {/* Mobile header (desktop header lives on left panel) */}
            <div className="md:hidden text-center mb-6">
              <h1
                className={`${manrope.className} text-4xl font-bold mb-2`}
                style={{ letterSpacing: '-0.02em', color: '#000000' }}
              >
                Sign In
              </h1>
              <p className="text-[#595959] text-base">Welcome back! Please enter your details</p>
            </div>

            {/* Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-sm">
              {authError && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {authError}
                </div>
              )}

              {/* Google Button (same style as Sign Up) */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full bg-white border-2 border-black text-black font-medium py-3 rounded-lg
                           flex items-center justify-center gap-3 transition hover:bg-black hover:text-white mb-6"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-[#EEEEEE]" />
                <span className="text-sm text-[#595959]">or continue with email</span>
                <div className="h-px flex-1 bg-[#EEEEEE]" />
              </div>

              {/* Form */}
              <Formik
                initialValues={authInitialValues.login}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="mb-5">
                      <FormikInput
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="mb-6">
                      <FormikPasswordInput
                        label="Password"
                        name="password"
                        placeholder="••••••••"
                        showPassword={showPassword}
                        onTogglePassword={togglePasswordVisibility}
                      />
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <FormikCheckbox label="Keep me signed in" name="agreeToTerms" />
                      <Link href="/auth/resetpassword" className="text-sm font-medium text-[#3b5054] hover:underline">
                        Forgot Password?
                      </Link>
                    </div>

                    <FormikSubmitButton

                      isSubmitting={isSubmitting}
                      className={manrope.className}>
                      Login
                    </FormikSubmitButton>



                  </Form>
                )}
              </Formik>

              {/* Sign Up Link */}
              <div className="text-center mt-6">
                <p className="text-[#595959] text-sm">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/auth/signup')}
                    className="text-[#3b5054] font-medium hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AuthLayout>
  );
};

export default Login;
