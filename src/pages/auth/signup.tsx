import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import { FormikHelpers } from 'formik';
import { useAppDispatch } from '@/hooks/hooks';
import { SignupSchema } from '../../validations/schemas';
import {
  FormikInput,
  FormikPasswordInput,
  FormikCheckbox,
  FormikSubmitButton,
  FormikSelect,
} from '../../formik/component';
import { authInitialValues, createFormSubmissionHandler } from '../../formik/utils';
import { RegisterResponse, userSignUpAsync } from '@/services/auth/asyncThunk';
import type { RegisterDto } from '@/services/auth/endpoints';
import Toast from '@/components/Toast';
import { AuthLayout } from '@/components/layouts';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'], weight: ['300', '800'] });

interface SignUpUserData extends Record<string, unknown> {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  conditions: boolean;
}

const roles = ['agent', 'va'] as const;

const SignUp = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError] = useState('');

  const handleGoogleAuth = async () => {
    console.log('Google Auth clicked');
  };

  const toRegisterDto = (v: SignUpUserData): RegisterDto => ({
    email: v.email,
    password: v.password,
    businessName: v.name,
    role: v.role,
  });

  const registerUser = async (userData: SignUpUserData): Promise<RegisterResponse> => {
    const dto = toRegisterDto(userData);
    const result = await dispatch(userSignUpAsync(dto)).unwrap();
    return result;
  };

  const handleSuccess = (response: unknown, formikActions: FormikHelpers<SignUpUserData>) => {
    const res = response as RegisterResponse;
    Toast.fire({
      icon: 'success',
      title: 'Registration successful',
      text: `Welcome, ${res.user?.businessName || res.user?.email || 'User'}!`,
    });
    formikActions.setSubmitting(false);
    formikActions.resetForm();
    router.push('/auth/login');
  };

  const submitRegister = async (data: Partial<SignUpUserData>): Promise<RegisterResponse> => {
    return registerUser(data as SignUpUserData);
  };

  const handleSubmit = createFormSubmissionHandler<SignUpUserData>(
    submitRegister,
    handleSuccess,
    // handleError,
    // { formatData: true, excludeFields: ['conditions'] }
  );

  const base = (authInitialValues.signup ?? {}) as Partial<SignUpUserData>;
  const initialValues: SignUpUserData = {
    name: base.name ?? '',
    email: base.email ?? '',
    password: base.password ?? '',
    confirmPassword: base.confirmPassword ?? '',
    role: base.role ?? 'agent',
    conditions: typeof base.conditions === 'boolean' ? base.conditions : false,
  };

  return (
    <AuthLayout>
      {/* Split layout: left = image/color, right = form */}
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* LEFT PANEL (image + color) */}
        <div
          className="relative hidden md:flex items-center justify-center p-10"
          style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)' }}
        >
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            {/* Optional background image overlay; replace with your image path or remove */}
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
              Create your account
            </h2>
            <p className="mt-4 text-slate-300">
              Join us to get access to your dashboard and tools.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL (form) */}
        <div className="flex items-center justify-center bg-[#EEEEEE] p-6 md:p-10">
          <div className="w-full max-w-2xl">
            {/* Mobile logo for small screens */}
            <div className="md:hidden flex justify-center mb-8">
              <img src="/logo.png" alt="One West Group" className="h-16 max-w-[240px]" />
            </div>

            {/* Header (mobile only; desktop header is on the left panel) */}
            <div className="md:hidden text-center mb-6">
              <h1
                className={`${manrope.className} text-4xl font-bold mb-2`}
                style={{ letterSpacing: '-0.02em', color: '#000000' }}
              >
                Sign Up
              </h1>
              <p className="text-[#595959] text-base">Create your account to get started</p>
            </div>

            {/* Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-sm">
              {authError && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {authError}
                </div>
              )}

              {/* Google Button */}
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
                Sign up with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-[#EEEEEE]" />
                <span className="text-sm text-[#595959]">or sign up with email</span>
                <div className="h-px flex-1 bg-[#EEEEEE]" />
              </div>

              {/* Form */}
              <Formik<SignUpUserData>
                initialValues={initialValues}
                validationSchema={SignupSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="mb-5">
                      <FormikInput label="Name" name="name" placeholder="Enter your full name" />
                    </div>

                    <div className="mb-5">
                      <FormikInput label="Email Address" name="email" type="email" placeholder="you@example.com" />
                    </div>

                    <div className="mb-5">
                      <FormikSelect
                        label="Role"
                        name="role"
                        options={roles.map((role) => ({ label: role.toUpperCase(), value: role }))}
                      />
                    </div>

                    <div className="mb-5">
                      <FormikPasswordInput
                        label="Password"
                        name="password"
                        placeholder="••••••••"
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword((s) => !s)}
                      />
                    </div>

                    <div className="mb-6">
                      <FormikPasswordInput
                        label="Confirm Password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        showPassword={showConfirmPassword}
                        onTogglePassword={() => setShowConfirmPassword((s) => !s)}
                      />
                    </div>

                    <div className="mb-6">
                      <FormikCheckbox
                        label="I accept the Terms & Conditions and Privacy Policy"
                        name="conditions"
                      />
                    </div>

                    <FormikSubmitButton
                      isSubmitting={isSubmitting}
                      className={manrope.className}
                    >
                      Register
                    </FormikSubmitButton>

                  </Form>
                )}
              </Formik>

              <div className="text-center mt-6">
                <p className="text-[#595959] text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/auth/login')}
                    className="text-[#3b5054] font-medium hover:underline"
                  >
                    Sign In
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

export default SignUp;
