// pages/dashboard/admin/users/actions/add-user-form.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Lock, Shield, } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAppDispatch,  } from '@/hooks/hooks';
import { DashboardLayout } from '@/components/layouts';
import { createUserAsync, updateUserAsync } from '@/services/admin/asyncThunk';
import { AddEditUserFormProps, FormErrors, UserFormData } from '@/types/user';

export default function AddEditUserForm({ 
  mode = 'add', 
  userId, 
  initialUser 
}: AddEditUserFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'agent',
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && initialUser) {
      setFormData({
        name: initialUser.name,
        email: initialUser.email,
        password: '',
        role: initialUser.role,
        isActive: initialUser.isActive,
      });
    }
  }, [isEditMode, initialUser]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && userId) {
        const updateData: Partial<UserFormData> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await dispatch(updateUserAsync({ id: userId, data: updateData })).unwrap();
      } else {
        await dispatch(createUserAsync(formData)).unwrap();
      }
      router.push('/dashboard/admin/userManagement');
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  return (
    <DashboardLayout>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&display=swap');
        
        .font-manrope {
          font-family: 'Manrope', sans-serif;
        }
        
        .font-roboto {
          font-family: 'Roboto', sans-serif;
        }
      `}</style>

      <div className="flex-1 overflow-auto bg-[#EEEEEE] p-6 lg:p-8">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard/admin/userManagement')}
              className="inline-flex items-center gap-2 text-[#595959] hover:text-black font-roboto mb-4 transition-colors"
              style={{ fontWeight: 500 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Users
            </button>
            <h1 className="text-3xl font-manrope text-black" style={{ fontWeight: 800 }}>
              {isEditMode ? 'Edit User' : 'Add New User'}
            </h1>
            <p className="text-sm text-[#595959] font-roboto mt-2" style={{ fontWeight: 400 }}>
              {isEditMode ? 'Update user information and permissions' : 'Create a new user account'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-roboto text-black mb-2" style={{ fontWeight: 500 }}>
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-[#EEEEEE]'} rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10`}
                style={{ fontWeight: 400 }}
              />
              {errors.name && (
                <p className="text-xs text-red-600 font-roboto mt-1" style={{ fontWeight: 400 }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-roboto text-black mb-2" style={{ fontWeight: 500 }}>
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@example.com"
                className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-[#EEEEEE]'} rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10`}
                style={{ fontWeight: 400 }}
              />
              {errors.email && (
                <p className="text-xs text-red-600 font-roboto mt-1" style={{ fontWeight: 400 }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-roboto text-black mb-2" style={{ fontWeight: 500 }}>
                <Lock className="w-4 h-4" />
                {isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={isEditMode ? 'Enter new password' : 'Minimum 8 characters'}
                className={`w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-[#EEEEEE]'} rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10`}
                style={{ fontWeight: 400 }}
              />
              {errors.password && (
                <p className="text-xs text-red-600 font-roboto mt-1" style={{ fontWeight: 400 }}>
                  {errors.password}
                </p>
              )}
              {!errors.password && (
                <p className="text-xs text-[#595959] font-roboto mt-1" style={{ fontWeight: 400 }}>
                  Password must be at least 8 characters long
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-roboto text-black mb-2" style={{ fontWeight: 500 }}>
                <Shield className="w-4 h-4" />
                Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['agent', 'va', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleInputChange('role', role)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-roboto ${
                      formData.role === role
                        ? 'border-black bg-black text-white'
                        : 'border-[#EEEEEE] text-[#595959] hover:border-[#595959]'
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {role === 'admin' ? 'Admin' : role === 'agent' ? 'Agent' : 'VA'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#595959] font-roboto mt-2" style={{ fontWeight: 400 }}>
                {formData.role === 'admin' && 'Full system access and user management'}
                {formData.role === 'agent' && 'Can create and manage design requests'}
                {formData.role === 'va' && 'Can fulfill design requests'}
              </p>
            </div>

            {isEditMode && (
              <div>
                <label className="flex items-center gap-2 text-sm font-roboto text-black mb-2" style={{ fontWeight: 500 }}>
                  Account Status
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('isActive', !formData.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isActive ? 'bg-green-600' : 'bg-[#595959]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-roboto text-[#595959]" style={{ fontWeight: 400 }}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={() => router.push('/dashboard/admin/userManagement')}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-[#EEEEEE] rounded-lg text-sm font-manrope text-[#595959] hover:bg-[#EEEEEE] transition-colors disabled:opacity-50"
              style={{ fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-black rounded-lg text-sm font-manrope text-white hover:bg-[#595959] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontWeight: 700 }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Update User' : 'Create User'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}