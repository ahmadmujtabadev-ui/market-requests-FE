import * as Yup from "yup";

// Global Password Schema
const globalPasswordSchema = Yup.string()
  .min(8, "Password should contain at least 8 characters")
  .required("Required")
  .matches(/[0-9]/, "Password must contain a number")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character"
  );

// Authentication Schemas
export const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email")
    .required("Email Required"),
  password: globalPasswordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  role: Yup.string()
    .required("Role is required")
    .notOneOf([""], "Please select a role"),
  conditions: Yup.boolean()
    .oneOf([true], 'You must accept the Terms & Conditions')
    .required('Required'),

});

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email")
    .required("Email Required"),
  password: globalPasswordSchema,
  agreeToTerms: Yup.boolean()
});

export const ResetRequestSchema = Yup.object().shape({
  email: Yup.string()
    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email")
    .email("Invalid email")
    .required("Email Required"),
});

export const ChangePasswordSchema = Yup.object().shape({
  password: globalPasswordSchema,
  confirm_password: globalPasswordSchema,
});

// Profile Schemas
export const ProfileSetupSchema = Yup.object().shape({
  title: Yup.string().min(2, "Too Short!").max(50, "Too Long!"),
  org: Yup.string().min(2, "Too Short!").max(50, "Too Long!"),
  years_exp: Yup.number()
    .min(0, "Experience should be a positive number")
    .max(99, "Max limit reached"),
  area_interest: Yup.array(),
  legislation: Yup.array(),
  bio: Yup.string()
    .min(20, "Bio should be contain at least 20 characters")
    .max(1000, "Bio should contain at most 1000 characters"),
  campaign_type: Yup.array(),
  strategy_goal: Yup.array(),
  region: Yup.array(),
  stakeholders: Yup.array(),
  com_channel: Yup.array(),
  collab_initiatives: Yup.boolean(),
  network: Yup.array(),
});

export const EditProfileSchema = Yup.object().shape({
  fullname: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  avatar: Yup.string(),
  only_avatar: Yup.boolean(),
  role: Yup.string(),
  country: Yup.string(),
  sector: Yup.array(),
  objective: Yup.string(),
  bio: Yup.string()
    .min(20, "Bio should be contain at least 20 characters")
    .max(1000, "Bio should contain at most 1000 characters"),
});

export const UpdatePasswordSchema = Yup.object().shape({
  currentPassword: globalPasswordSchema,
  newPassword: globalPasswordSchema,
});

export const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email")
    .required("Required"),
});

export const validationSchema = Yup.object({
  leaseTitle: Yup.string()
    .min(3, 'Lease title must be at least 3 characters')
    .max(100, 'Lease title must be less than 100 characters')
    .required('Lease title is required'),
  startDate: Yup.date()
    .required('Start date is required')
    .typeError('Please enter a valid date'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .typeError('Please enter a valid date'),
  propertyAddress: Yup.string()
    .max(200, 'Property address must be less than 200 characters')
    .required('Property address is required'),
  notes: Yup.string()
    .max(500, 'Notes must be less than 500 characters'),
  document: Yup.mixed<File>()
    .required('Please upload a lease document')
    .test('fileSize', 'File size must be less than 10MB', (value: File | undefined) => {
      if (!value) return false;
      return value.size <= 10 * 1024 * 1024; // 10MB
    })
    .test('fileType', 'Only PDF and DOCX files are supported', (value: File | undefined) => {
      if (!value) return false;
      return ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(value.type);
    })
});

// Export the global password schema for reuse
export { globalPasswordSchema };