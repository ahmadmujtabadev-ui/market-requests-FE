import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/components';
import { useAppDispatch } from '@/hooks/hooks';
import { Form, Formik, FormikHelpers } from 'formik';

import Toast from '@/components/Toast';
import { userResetPasswordAsync } from '@/services/auth/asyncThunk';
import { authInitialValues } from '@/formik/utils';
import { FormikInput, FormikSubmitButton } from '@/formik/component';
import { ResetRequestSchema } from '@/validations/schemas';

// Define proper types
interface ResetPasswordData {
  email: string;
}

const ResetPassword = () => {
  const [authError, setAuthError] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();

  const resetPassword = async (userData: ResetPasswordData) => {
    if (!userData.email) {
      throw new Error("Email is required");
    }

    try {
      const result = await dispatch(userResetPasswordAsync(userData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (
    values: ResetPasswordData,
    formikHelpers: FormikHelpers<ResetPasswordData>
  ) => {
    try {
      const result = await resetPassword(values);

      Toast.fire({
        icon: "success",
        title: result.message || 'Reset link sent successfully',
        text: 'Please check your email for the reset link',
      });

      formikHelpers.resetForm();
      formikHelpers.setSubmitting(false);
      setAuthError('');
    } catch (error) {
      console.error('Reset password error:', error);

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
      <div className="bg-white p-5">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Reset your password
        </h2>

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
                loadingText="Signing In..."
              >
                Verify Email
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