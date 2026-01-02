/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Formik, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import Toast from '@/components/Toast';
import { DashboardLayout } from '@/components/layouts';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { deleteUserMeAsync, fetchUserMeAsync, updateUserMeAsync } from '@/services/auth/asyncThunk';
import { selectUser } from '@/redux/slices/userSlice';

const validationSchema = Yup.object({
  // username: Yup.string().required('Username is required'),
  // email: Yup.string().email('Invalid email').required('Email is required'),
  // position: Yup.string().required('Position is required'),
  // phoneNumber: Yup.string().required('Phone number is required'),
  // website: Yup.string().url('Invalid URL'),
  // about: Yup.string(),
  // socialLinks: Yup.array().of(
  //   Yup.object({
  //     id: Yup.number(),
  //     url: Yup.string().url('Invalid URL'),
  //   })
  // ),
});

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(selectUser);
  const [profileImage, setProfileImage] = useState<string | null | undefined>(null);

  const initialValues = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    phoneNumber: '',
    website: '',
    about: '',
    socialLinks: [{ id: 1, url: '' }],
  };

  const [formInitialValues, setFormInitialValues] = useState(initialValues);

  useEffect(() => {
    try {
      dispatch(fetchUserMeAsync()).unwrap();
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!profile) return;

    const fullName = (profile.name ?? '').trim();
    const [first = '', ...rest] = fullName.split(' ');
    const last = rest.join(' ');

    const newValues = {
      username: profile.email?.split('@')[0] ?? '',
      firstName: first,
      lastName: last,
      email: profile.email ?? '',
      position: profile.position ?? '',
      phoneNumber: profile.phoneNumber ?? profile.phone ?? '',
      website: profile.website ?? '',
      about: profile.about ?? '',
      socialLinks:
        profile.socialLinks && Array.isArray(profile.socialLinks)
          ? (profile.socialLinks as any[]).map((item, idx) => {
            const url = typeof item === 'string' ? item : item?.url;
            return { id: idx + 1, url: url ?? '' };
          })
          : [{ id: 1, url: '' }],
    };

    setFormInitialValues(newValues);

    if (profile) {
      setProfileImage(profile.profileImage);
    }
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (1 MB = 1,048,576 bytes)
      const maxSize = 1 * 1024 * 1024; // 1 MB in bytes
      
      if (file.size > maxSize) {
        Toast.fire({
          icon: 'error',
          title: 'Image size must be less than 1 MB. Please choose a smaller image.',
        });
        // Clear the input
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        Toast.fire({
          icon: 'success',
          title: 'Profile image uploaded successfully!',
        });
      };
      reader.onerror = () => {
        Toast.fire({
          icon: 'error',
          title: 'Failed to read image file. Please try again.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
    Toast.fire({
      icon: 'success',
      title: 'Profile image removed successfully!',
    });
  };

  const handleSubmit = async (values: typeof initialValues) => {
    const socialUrls = values.socialLinks
      .map((l) => l.url.trim())
      .filter(Boolean);

    const payload = {
      name: `${values.firstName} ${values.lastName}`.trim(),
      email: values.email,
      position: values.position,
      phoneNumber: values.phoneNumber,
      website: values.website,
      about: values.about,
      profileImage,
      socialLinks: socialUrls,
    };

    try {
      await dispatch(updateUserMeAsync(payload as any)).unwrap();
      Toast.fire({
        icon: 'success',
        title: 'Profile updated successfully!',
      });
    } catch (err: any) {
      console.error('Update profile failed:', err);
      Toast.fire({
        icon: 'error',
        title: err?.message || 'Failed to update profile. Please try again.',
      });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await dispatch(deleteUserMeAsync() as any).unwrap();
      Toast.fire({
        icon: 'success',
        title: 'Account deleted successfully',
      });
    } catch (err: any) {
      console.error('Delete account failed:', err);
      Toast.fire({
        icon: 'error',
        title: err?.message || 'Failed to delete account. Please try again.',
      });
    }
  };

  const initials =
    (formInitialValues.firstName?.charAt(0) || '') +
    (formInitialValues.lastName?.charAt(0) || '');

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

      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Formik
            enableReinitialize
            initialValues={formInitialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleSubmit: formikSubmit }) => (
              <div>
                {/* Profile Picture Section */}
                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-6 mb-6">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-2 border-[#EEEEEE]"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-[#EEEEEE] flex items-center justify-center">
                          <span
                            className="text-3xl text-[#595959] font-manrope"
                            style={{ fontWeight: 800 }}
                          >
                            {initials || 'U'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <div
                            className="px-4 py-2 bg-white border-2 border-red-500 text-red-500 rounded-lg text-sm font-manrope hover:bg-red-50 transition-colors duration-200"
                            style={{ fontWeight: 600 }}
                          >
                            Upload new photo
                          </div>
                        </label>
                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="px-4 py-2 text-[#595959] hover:text-black text-sm font-manrope transition-colors duration-200"
                          style={{ fontWeight: 600 }}
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-xs text-[#595959] mt-2 font-roboto">
                        Maximum file size: 1 MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-6 mb-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Username */}
                    <div>
                      <label
                        className="block text-sm text-[#595959] mb-2 font-manrope"
                        style={{ fontWeight: 600 }}
                      >
                        Username*
                      </label>
                      <Field
                        type="text"
                        name="username"
                        className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 font-roboto text-[#595959]"
                        style={{ fontWeight: 400 }}
                      />
                      {errors.username && touched.username && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.username}
                        </div>
                      )}
                    </div>

                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          className="block text-sm text-[#595959] mb-2 font-manrope"
                          style={{ fontWeight: 600 }}
                        >
                          First Name*
                        </label>
                        <Field
                          type="text"
                          name="firstName"
                          className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 font-roboto text-[#595959]"
                          style={{ fontWeight: 400 }}
                        />
                        {errors.firstName && touched.firstName && (
                          <div className="text-red-500 text-sm mt-1">
                            {errors.firstName}
                          </div>
                        )}
                      </div>
                      <div>
                        <label
                          className="block text-sm text-[#595959] mb-2 font-manrope"
                          style={{ fontWeight: 600 }}
                        >
                          Last Name*
                        </label>
                        <Field
                          type="text"
                          name="lastName"
                          className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 font-roboto text-[#595959]"
                          style={{ fontWeight: 400 }}
                        />
                        {errors.lastName && touched.lastName && (
                          <div className="text-red-500 text-sm mt-1">
                            {errors.lastName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email & Position */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          className="block text-sm text-[#595959] mb-2 font-manrope"
                          style={{ fontWeight: 600 }}
                        >
                          Email*
                        </label>
                        <Field
                          type="email"
                          name="email"
                          readOnly
                          className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none font-roboto text-[#595959] bg-gray-50 cursor-not-allowed"
                          style={{ fontWeight: 400 }}
                        />
                        {errors.email && touched.email && (
                          <div className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </div>
                        )}
                      </div>
                      <div>
                        <label
                          className="block text-sm text-[#595959] mb-2 font-manrope"
                          style={{ fontWeight: 600 }}
                        >
                          Position*
                        </label>
                        <Field
                          type="text"
                          name="position"
                          className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 font-roboto text-[#595959]"
                          style={{ fontWeight: 400 }}
                        />
                        {errors.position && touched.position && (
                          <div className="text-red-500 text-sm mt-1">
                            {errors.position}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone Number & Website */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          className="block text-sm text-[#595959] mb-2 font-manrope"
                          style={{ fontWeight: 600 }}
                        >
                          Phone Number*
                        </label>
                        <Field
                          type="tel"
                          name="phoneNumber"
                          className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 font-roboto text-[#595959]"
                          style={{ fontWeight: 400 }}
                        />
                        {errors.phoneNumber && touched.phoneNumber && (
                          <div className="text-red-500 text-sm mt-1">
                            {errors.phoneNumber}
                          </div>
                        )}
                      </div>
                      <div>
                        <label
                          className="block text-sm text-[#595959] mb-2 font-manrope"
                          style={{ fontWeight: 600 }}
                        >
                          Website*
                        </label>
                        <Field
                          type="url"
                          name="website"
                          className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 font-roboto text-[#595959]"
                          style={{ fontWeight: 400 }}
                        />
                        {errors.website && touched.website && (
                          <div className="text-red-500 text-sm mt-1">
                            {errors.website}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* About */}
                    <div>
                      <label
                        className="block text-sm text-[#595959] mb-2 font-manrope"
                        style={{ fontWeight: 600 }}
                      >
                        About*
                      </label>
                      <Field
                        as="textarea"
                        name="about"
                        rows={4}
                        className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 font-roboto text-[#595959] resize-none"
                        style={{ fontWeight: 400 }}
                        placeholder="Write something about yourself..."
                      />
                      {errors.about && touched.about && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.about}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-6 mb-6">
                  <h3
                    className="text-xl text-black font-manrope mb-4"
                    style={{ fontWeight: 800 }}
                  >
                    Social Media
                  </h3>

                  <FieldArray name="socialLinks">
                    {({ push, remove }) => (
                      <div>
                        <div className="space-y-4">
                          {values.socialLinks.map((link, index) => (
                            <div key={link.id}>
                              <div className="flex items-center justify-between mb-2">
                                <label
                                  className="block text-sm text-[#595959] font-manrope"
                                  style={{ fontWeight: 600 }}
                                >
                                  Network {index + 1}
                                </label>
                                {values.socialLinks.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <Field
                                type="url"
                                name={`socialLinks.${index}.url`}
                                placeholder="https://www.example.com/profile"
                                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 font-roboto text-[#595959]"
                                style={{ fontWeight: 400 }}
                              />
                              {errors.socialLinks?.[index] &&
                                touched.socialLinks?.[index] && (
                                  <div className="text-red-500 text-sm mt-1">
                                    {typeof errors.socialLinks[index] ===
                                      'object' &&
                                      errors.socialLinks[index]?.url}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => push({ id: Date.now(), url: '' })}
                          className="mt-4 flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-[#595959] transition-colors duration-200 font-manrope"
                          style={{ fontWeight: 600 }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add more link
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="px-4 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors duration-200 font-manrope"
                    style={{ fontWeight: 600 }}
                  >
                    Delete Account
                  </button>

                  <button
                    type="button"
                    onClick={() => formikSubmit()}
                    className="px-8 py-3 bg-black text-white rounded-lg hover:bg-[#595959] transition-colors duration-200 shadow-sm hover:shadow-md font-manrope"
                    style={{ fontWeight: 800 }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </Formik>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;