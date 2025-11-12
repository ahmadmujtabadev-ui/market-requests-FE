import * as Yup from "yup";
const globalPasswordSchema = Yup.string()
  .min(8, "Password should contain at least 8 characters")
  .required("Required")
  .matches(/[0-9]/, "Password must contain a number")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter") // At least one capital letter
  .matches(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character"
  ); // At least one special character,
export const SignupSchema = Yup.object().shape({
  fullname: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  email: Yup.string()
    .email("Invalid email")
    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email")
    .required("Required"),
  password: globalPasswordSchema,
  conditions: Yup.boolean()
    .test(
      "is-true",
      "Please accept the Terms & Conditions",
      (value) => value === true
    )
    .required("Required"),
});
export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email")
    .required("Required"),
  password: globalPasswordSchema,
});

export const ResetRequestSchema = Yup.object().shape({
  email: Yup.string()
    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email")
    .email("Invalid email")
    .required("Required"),
});

export const ChangePasswordSchema = Yup.object().shape({
  password: globalPasswordSchema,
  confirm_password: globalPasswordSchema,
});
// User
// Profile Setup Form Schema
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
// Edit profile schema
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
// Update Password schema
export const UpdatePasswordSchema = Yup.object().shape({
  currentPassword: globalPasswordSchema,
  newPassword: globalPasswordSchema,
});

// Add Email schema
export const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email")
    .required("Required"),
});
