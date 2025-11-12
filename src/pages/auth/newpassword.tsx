// src/pages/auth/newpassword.tsx

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PageContainer } from '@/components/ui/components';

const NewPassword = () => {
  const [isLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'tenant',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Optional: Use router.push('/auth/login') if you want to redirect
  };

  return (
     <PageContainer
          >
      <div className="bg-white shadow-2xl p-8 w-[473px] h-[361px]">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Create New Password
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[16px] font-bold text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-[18px] font-bold border border-gray-200 focus:outline-none text-[#BABABA]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[16px] font-bold text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-[18px] font-bold border border-gray-200 focus:outline-none text-[#BABABA]"
                required={!isLogin}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="text-[16px] w-full bg-blue-600 text-white py-3 px-4 font-medium hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default NewPassword;
