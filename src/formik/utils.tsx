import { FormikHelpers } from 'formik';

export interface AuthInitialValues {
  login: {
    email: string;
    password: string;
    agreeToTerms: boolean;
  };
  signup: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    conditions: boolean;
  };
  resetRequest: {
    email: string;
  };
  changePassword: {
    password: string;
    confirm_password: string;
  };
}

export interface ProfileInitialValues {
  setup: {
    title: string;
    org: string;
    years_exp: string;
    area_interest: string[];
    legislation: string[];
    bio: string;
    campaign_type: string[];
    strategy_goal: string[];
    region: string[];
    stakeholders: string[];
    com_channel: string[];
    collab_initiatives: boolean;
    network: string[];
  };
  edit: {
    fullname: string;
    avatar: string;
    only_avatar: boolean;
    role: string;
    country: string;
    sector: string[];
    objective: string;
    bio: string;
  };
  updatePassword: {
    currentPassword: string;
    newPassword: string;
  };
  email: {
    email: string;
  };
}

export interface FormikErrorResponse {
  response?: {
    data?: {
      errors?: Record<string, string[]>;
      message?: string;
    };
  };
}

// --- Initial Values ---
export const authInitialValues: AuthInitialValues = {
  login: { email: '', password: '', agreeToTerms: false },
  signup: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    conditions: false,
  },
  resetRequest: { email: '' },
  changePassword: { password: '', confirm_password: '' },
};

export const profileInitialValues: ProfileInitialValues = {
  setup: {
    title: '',
    org: '',
    years_exp: '',
    area_interest: [],
    legislation: [],
    bio: '',
    campaign_type: [],
    strategy_goal: [],
    region: [],
    stakeholders: [],
    com_channel: [],
    collab_initiatives: false,
    network: [],
  },
  edit: {
    fullname: '',
    avatar: '',
    only_avatar: false,
    role: '',
    country: '',
    sector: [],
    objective: '',
    bio: '',
  },
  updatePassword: { currentPassword: '', newPassword: '' },
  email: { email: '' },
};

// --- Error Handler ---
export const handleFormError = (
  error: FormikErrorResponse,
  setFieldError: (field: string, message: string) => void
): void => {
  if (error.response?.data?.errors) {
    Object.entries(error.response.data.errors).forEach(([field, messages]) => {
      setFieldError(field, messages[0]);
    });
  } else if (error.response?.data?.message) {
    setFieldError('general', error.response.data.message);
  } else {
    setFieldError('general', 'An unexpected error occurred');
  }
};

// --- Format Data ---
export const formatFormData = <T extends Record<string, unknown>>(
  values: T,
  excludeFields: string[] = []
): Partial<T> => {
  const formData = { ...values };
  excludeFields.forEach(field => delete formData[field]);

  Object.keys(formData).forEach(key => {
    if (formData[key] === '' || formData[key] == null) {
      delete formData[key];
    }
  });

  return formData;
};

// Form validation helpers
// --- Validations ---
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean =>
  password === confirmPassword;

export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

export const validateEmailExists = async (): Promise<boolean> => {
  try {
    return false; // Replace with real logic
  } catch (error) {
    console.error('Email validation error:', error);
    return false;
  }
};

// --- Submission Handler ---
interface FormOptions<T> {
  formatData?: boolean;
  excludeFields?: (keyof T)[];
}

// Form submission helpers
export function createFormSubmissionHandler<T extends Record<string, unknown>>(
  apiCall: (data: Partial<T>) => Promise<unknown>,
  successCallback?: (response: unknown, actions: FormikHelpers<T>) => void,
  errorCallback?: (error: unknown, actions: FormikHelpers<T>) => void,
  options: FormOptions<T> = {}
) {
  return async (values: T, formikActions: FormikHelpers<T>) => {
    const { setSubmitting, setFieldError, setStatus } = formikActions;

    try {
      setStatus?.(null);

      const formData = options.formatData
        ? formatFormData(values, options.excludeFields as string[])
        : values;

      const response = await apiCall(formData);

      successCallback?.(response, formikActions);
    } catch (error) {
      console.error('Form submission error:', error);
      if (errorCallback) {
        errorCallback(error, formikActions);
      } else {
        handleFormError(error as FormikErrorResponse, setFieldError);
      }
    } finally {
      setSubmitting(false);
    }
  };
}

// Form reset helpers
export const resetFormWithDelay = (resetForm: () => void, delay = 3000) => {
  setTimeout(resetForm, delay);
};

// --- Transformers ---
export const transformers = {
  email: (value: string) => value.toLowerCase().trim(),
  phone: (value: string) => value.replace(/\D/g, ''),
  name: (value: string) => value.trim().replace(/\s+/g, ' '),
  capitalize: (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
};