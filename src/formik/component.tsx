// formik/components.tsx
import React from 'react';
import type { InputHTMLAttributes } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { Field, ErrorMessage } from 'formik';
import { Eye, EyeOff } from 'lucide-react';

// Types
interface BaseFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  label: string;
  name: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
}

interface PasswordFieldProps extends BaseFieldProps {
  showPassword: boolean;
  onTogglePassword: () => void;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  label: string;
  name: string;
  placeholder?: string;
  options: (SelectOption | string)[];
  className?: string;
}

interface FormikTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  label: string;
  name: string;
  rows?: number;
}

interface SubmitButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children: React.ReactNode;
  isSubmitting: boolean;
  loadingText?: string;
  className?: string;
}

export const FormikInput: React.FC<BaseFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  className = "",
  labelClassName = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className={`block text-sm md:text-base font-semibold text-gray-700 mb-2 ${labelClassName}`}>{label}</label>
      <Field
        type={type}
        name={name}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 text-[18px] font-bold border border-2  border-gray-200 focus:outline-none text-[#BABABA] ${className}`}
        {...props}
      />
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-xs md:text-sm mt-1 font-medium"
      />
    </div>
  );
};

export const FormikPasswordInput: React.FC<PasswordFieldProps> = ({
  label,
  name,
  placeholder,
  showPassword,
  onTogglePassword,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <Field
          type={showPassword ? 'text' : 'password'}
          name={name}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 text-[18px] font-bold border border-2  border-gray-200 focus:outline-none text-[#BABABA] ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-xs md:text-sm mt-1 font-medium"
      />
    </div>
  );
};

export const FormikCheckbox: React.FC<BaseFieldProps> = ({
  label,
  name,
  className = "",
  labelClassName = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-3">
        <Field
          type="checkbox"
          name={name}
          className={`mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${className}`}
          {...props}
        />
        <label className={`text-sm md:text-base text-gray-700 font-medium ${labelClassName}`}>
          {label}
        </label>
      </div>
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-xs md:text-sm mt-1 font-medium"
      />
    </div>
  );
};

export const FormikSelect: React.FC<SelectFieldProps> = ({
  label,
  name,
  options = [],
  placeholder = "Select an option",
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <Field
        as="select"
        name={name}
        className={`w-full px-3 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option
            key={index}
            value={typeof option === 'string' ? option : option.value}
          >
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </Field>
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-xs md:text-sm mt-1 font-medium"
      />
    </div>
  );
};

export const FormikTextarea: React.FC<FormikTextareaProps> = ({
  label,
  name,
  placeholder,
  rows = 4,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">{label}</label>
      <Field
        as="textarea"
        name={name}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 placeholder-gray-400 resize-vertical ${className}`}
        {...props}
      />
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-xs md:text-sm mt-1 font-medium"
      />
    </div>
  );
};

export const FormikSubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  isSubmitting,
  loadingText = "Loading...",
  className = "",
  ...props
}) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 md:py-4 px-4  font-semibold text-sm md:text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center gap-2">
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};