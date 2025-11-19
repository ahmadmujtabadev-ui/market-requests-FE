import React, { useEffect, useState } from 'react';
import { ArrowLeft, Upload, X, FileText, Building2, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/hooks/hooks';
import { useRouter } from 'next/router';
import { createTemplateAsync, updateTemplateAsync } from '@/services/template/asyncThunk';

const RESIDENTIAL_CATEGORIES = [
  'Guides',
  'Property Brochures',
  'Just Listed',
  'Coming Soon',
  'Open House',
  'Just Sold',
  'Price Improvement',
  'Under Contract',
  'Market Updates',
  'Testimonials',
  'Instagram Posts',
  'Instagram Stories',
  'Highlight Covers',
  'Flyers',
];

const COMMERCIAL_CATEGORIES = [
  'For Sale',
  'For Lease',
  'Sold/Leased',
  'Price Adjustment',
  'Project Announcements',
  'Market Reports',
  'Property Highlights',
  'Broker Branding',
];

interface FormValues {
  title: string;
  type: 'residential' | 'commercial';
  category: string;
  canvaUrl: string;
  previewFile: File | null;
}

interface Template {
  id: string;
  title: string;
  type: 'residential' | 'commercial';
  category: string;
  canvaUrl: string;
  previewUrl?: string;      // <— match backend
}

interface AddTemplateFormProps {
  mode: 'create' | 'edit';
  templateId?: string;
  initialTemplate?: Template | null;
}

export default function AddTemplateForm({
  mode,
  templateId,
  initialTemplate,
}: AddTemplateFormProps) {
  const dispatch = useAppDispatch();
  const [previewImage, setPreviewImage] = useState<string>('');
  const router = useRouter();
  console.log("initial 70",initialTemplate)

  // Validation schema depends on whether we already have a preview image (edit mode)
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Template title is required')
      .trim()
      .min(3, 'Title must be at least 3 characters'),
    category: Yup.string().required('Category is required'),
    canvaUrl: Yup.string()
      .required('Canva URL is required')
      .url('Please enter a valid URL')
      .matches(/^https?:\/\//, 'URL must start with http:// or https://'),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      title: '',
      type: 'residential',
      category: '',
      canvaUrl: '',
      previewFile: null,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log("values", values)
        const formData = new FormData();
        formData.append('title', values.title.trim());
        formData.append('type', values.type);
        formData.append('category', values.category);
        formData.append('canvaUrl', values.canvaUrl);

        if (values.previewFile) {
          formData.append('previewUrl', values.previewFile);
        }

        if (mode === 'edit' && templateId) {
          await dispatch(
            updateTemplateAsync({ id: templateId, data: formData })
          ).unwrap();
          router.push('/dashboard/admin/templates/templates');

        } else {
          await dispatch(createTemplateAsync(formData)).unwrap();
          router.push('/dashboard/admin/templates/templates');
        }

      } catch (error) {
        console.error(
          mode === 'edit'
            ? 'Failed to update template:'
            : 'Failed to create template:',
          error
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // When editing, prefill form values and preview image
  useEffect(() => {
    if (mode === 'edit' && initialTemplate) {
      formik.setValues({
        title: initialTemplate.title || '',
        type: initialTemplate.type || 'residential',
        category: initialTemplate.category || '',
        canvaUrl: initialTemplate.canvaUrl || '',
        previewFile: null,
      });

      if (initialTemplate.previewUrl) {
        setPreviewImage(initialTemplate.previewUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialTemplate]);

  const categories =
    formik.values.type === 'residential'
      ? RESIDENTIAL_CATEGORIES
      : COMMERCIAL_CATEGORIES;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      formik.setFieldValue('previewFile', file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePreview = () => {
    formik.setFieldValue('previewFile', null);
    setPreviewImage('');
  };

  const handleTypeChange = (type: 'residential' | 'commercial') => {
    formik.setFieldValue('type', type);
    formik.setFieldValue('category', '');
  };

  const handleBack = () => {
    if (
      formik.dirty &&
      !window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
    ) {
      return;
    }
    router.push('/dashboard/admin/templates');
  };

  const isEdit = mode === 'edit';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#EEEEEE]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&display=swap');
          
          .font-manrope {
            font-family: 'Manrope', sans-serif;
          }
          
          .font-roboto {
            font-family: 'Roboto', sans-serif;
          }
        `}</style>

        <div className="p-6 lg:p-8">
          <div className="w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={handleBack}
                type="button"
                className="inline-flex items-center gap-2 text-[#595959] hover:text-black mb-4 font-roboto transition-colors"
                style={{ fontWeight: 500 }}
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Templates
              </button>

              <h1
                className="text-3xl text-black font-manrope mb-2"
                style={{ fontWeight: 800 }}
              >
                {isEdit ? 'Edit Template' : 'Add New Template'}
              </h1>
              <p
                className="text-base text-[#595959] font-roboto"
                style={{ fontWeight: 400 }}
              >
                {isEdit
                  ? 'Update this marketing template for agents'
                  : 'Create a new marketing template for agents'}
              </p>
            </div>

            {/* Form Container */}
            <form onSubmit={formik.handleSubmit}>
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 mb-6">
                {/* Template Type */}
                <div className="mb-6">
                  <label
                    className="block text-sm text-black font-manrope mb-3"
                    style={{ fontWeight: 700 }}
                  >
                    Template Type *
                  </label>
                  <div className="inline-flex rounded-lg bg-[#EEEEEE] p-1">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('residential')}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-manrope transition-all ${formik.values.type === 'residential'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-[#595959] hover:text-black'
                        }`}
                      style={{ fontWeight: 700 }}
                    >
                      <FileText className="w-4 h-4" />
                      Residential
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('commercial')}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-manrope transition-all ${formik.values.type === 'commercial'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-[#595959] hover:text-black'
                        }`}
                      style={{ fontWeight: 700 }}
                    >
                      <Building2 className="w-4 h-4" />
                      Commercial
                    </button>
                  </div>
                </div>

                {/* Template Title */}
                <div className="mb-6">
                  <label
                    htmlFor="title"
                    className="block text-sm text-black font-manrope mb-2"
                    style={{ fontWeight: 700 }}
                  >
                    Template Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter template title"
                    className={`w-full px-4 py-3 border rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10 ${formik.touched.title && formik.errors.title
                      ? 'border-red-500'
                      : 'border-[#EEEEEE]'
                      }`}
                    style={{ fontWeight: 400 }}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <p
                      className="text-sm text-red-600 font-roboto mt-1"
                      style={{ fontWeight: 400 }}
                    >
                      {formik.errors.title}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label
                    htmlFor="category"
                    className="block text-sm text-black font-manrope mb-2"
                    style={{ fontWeight: 700 }}
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg text-sm font-roboto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10 ${formik.touched.category && formik.errors.category
                      ? 'border-red-500'
                      : 'border-[#EEEEEE]'
                      }`}
                    style={{ fontWeight: 400 }}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formik.touched.category && formik.errors.category && (
                    <p
                      className="text-sm text-red-600 font-roboto mt-1"
                      style={{ fontWeight: 400 }}
                    >
                      {formik.errors.category}
                    </p>
                  )}
                </div>

                {/* Canva URL */}
                <div className="mb-6">
                  <label
                    htmlFor="canvaUrl"
                    className="block text-sm text-black font-manrope mb-2"
                    style={{ fontWeight: 700 }}
                  >
                    Canva Template URL *
                  </label>
                  <input
                    type="url"
                    id="canvaUrl"
                    name="canvaUrl"
                    value={formik.values.canvaUrl}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="https://www.canva.com/design/..."
                    className={`w-full px-4 py-3 border rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10 ${formik.touched.canvaUrl && formik.errors.canvaUrl
                      ? 'border-red-500'
                      : 'border-[#EEEEEE]'
                      }`}
                    style={{ fontWeight: 400 }}
                  />
                  {formik.touched.canvaUrl && formik.errors.canvaUrl && (
                    <p
                      className="text-sm text-red-600 font-roboto mt-1"
                      style={{ fontWeight: 400 }}
                    >
                      {formik.errors.canvaUrl}
                    </p>
                  )}
                  <p
                    className="text-xs text-[#595959] font-roboto mt-1"
                    style={{ fontWeight: 400 }}
                  >
                    Link to the Canva template that agents can customize
                  </p>
                </div>

                {/* Preview Image Upload */}
                <div className="mb-6">
                  <label
                    className="block text-sm text-black font-manrope mb-2"
                    style={{ fontWeight: 700 }}
                  >
                    Preview Image *
                  </label>

                  {!previewImage ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-[#EEEEEE]/50 transition-colors ${formik.touched.previewFile && formik.errors.previewFile
                        ? 'border-red-500'
                        : 'border-[#EEEEEE]'
                        }`}
                    >
                      <input
                        type="file"
                        id="preview"
                        accept="image/*"
                        onChange={handleFileChange}
                        onBlur={formik.handleBlur}
                        className="hidden"
                      />
                      <label htmlFor="preview" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-[#595959] mx-auto mb-4" />
                        <p
                          className="text-sm text-black font-roboto mb-1"
                          style={{ fontWeight: 500 }}
                        >
                          Click to upload preview image
                        </p>
                        <p
                          className="text-xs text-[#595959] font-roboto"
                          style={{ fontWeight: 400 }}
                        >
                          PNG, JPG up to 5MB
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative border border-[#EEEEEE] rounded-lg p-4">
                      <button
                        type="button"
                        onClick={removePreview}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {formik.touched.previewFile && formik.errors.previewFile && (
                    <p
                      className="text-sm text-red-600 font-roboto mt-1"
                      style={{ fontWeight: 400 }}
                    >
                      {formik.errors.previewFile as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border border-[#EEEEEE] text-[#595959] rounded-lg font-manrope hover:bg-[#EEEEEE] transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting || !formik.isValid}
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-manrope hover:bg-[#595959] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 700 }}
                >
                  {formik.isSubmitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {isEdit ? 'Update Template' : 'Create Template'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
