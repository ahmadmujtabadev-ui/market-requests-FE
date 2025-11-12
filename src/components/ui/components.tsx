
import React from 'react';

// Google Icon Component
interface GoogleIconProps {
  className?: string;
}

export const GoogleIcon: React.FC<GoogleIconProps> = ({ className = "w-5 h-5 md:w-6 md:h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

interface SocialAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType;
  children: React.ReactNode;
}

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  onClick,
  children,
  icon: Icon,
  className = "",
  ...props
}) => (
  <button
    onClick={onClick}
    className={`w-full bg-[#580F410F] hover:bg-gray-100 border-2 border-gray-200 py-3 md:py-4 px-4 flex items-center justify-center gap-3 transition-all duration-200 group ${className}`}
    {...props}
  >
    {Icon && <Icon />}
    <span className="text-gray-700 text-sm md:text-base font-semibold group-hover:text-gray-800">
      {children}
    </span>
  </button>
);

// Divider Component
interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ text = "or", className = "" }) => (
  <div className={`flex items-center mb-6 ${className}`}>
    <div className="flex-grow border-t border-gray-300"></div>
    <span className="px-4 text-gray-500 text-sm md:text-base">{text}</span>
    <div className="flex-grow border-t border-gray-300"></div>
  </div>
);

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "p-6 md:p-8",
  ...props
}) => (
  <div className={`bg-white shadow-2xl ${padding} ${className}`} {...props}>
    {children}
  </div>
);

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 bg-no-repeat bg-cover ${className}`}
      // style={
      //   backgroundImage
      //     ? {
      //         backgroundImage: `url(${backgroundImage})`,
      //         backgroundPosition: "top left",
      //         backgroundSize: "cover",
      //       }
      //     : {}
      // }
      {...props}
    >
      <div className="w-full max-w-md mx-auto">{children}</div>
    </div>
  );
};

interface AuthHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  className?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  className = "",
  ...props
}) => (
  <div className={`text-center mb-6 md:mb-8 ${className}`} {...props}>
    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{title}</h1>
    {subtitle && <p className="text-gray-600 text-sm md:text-base">{subtitle}</p>}
  </div>
);

interface AuthLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AuthLink: React.FC<AuthLinkProps> = ({
  children,
  onClick,
  className = "",
  ...props
}) => (
  <button
    onClick={onClick}
    className={`text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: string;
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "h-5 w-5",
  color = "border-white",
  className = "",
}) => (
  <div className={`animate-spin rounded-full ${size} border-b-2 ${color} ${className}`}></div>
);

// Alert Component
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "error" | "success" | "warning" | "info";
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  message,
  className = "",
  ...props
}) => {
  const baseClasses = "p-4 rounded-lg mb-4 text-sm md:text-base";
  const typeClasses: Record<string, string> = {
    error: "bg-red-50 text-red-800 border border-red-200",
    success: "bg-green-50 text-green-800 border border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    info: "bg-blue-50 text-blue-800 border border-blue-200",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`} {...props}>
      {message}
    </div>
  );
};

