import React, { useEffect, useState } from "react";
import { ArrowLeft, Upload, X, FileText, Building2, Save, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layouts";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useRouter } from "next/router";
import { createTemplateAsync, updateTemplateAsync } from "@/services/template/asyncThunk";
import { createCategoryAsync, fetchCategoriesAsync } from "@/services/category/asyncThunk";
import { LoadingOverlay } from "@/components/loaders/overlayloader";
import { selectCategoryItems, selectCategoryLoading } from "@/redux/slices/categorySlice";

// Add Category Modal Component
interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectCategoryLoading);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    order: 0,
  });

  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(
        createCategoryAsync({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive,
          order: formData.order,
        })
      ).unwrap();

      setFormData({
        name: "",
        description: "",
        isActive: true,
        order: 0,
      });
      setErrors({});

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      isActive: true,
      order: 0,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-y-auto px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 font-manrope">
        <div className="flex items-center justify-between p-6 border-b border-[#EEEEEE]">
          <h2 className="text-xl font-bold text-black">Add New Category</h2>
          <button
            onClick={handleClose}
            className="text-[#595959] hover:text-black transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-black mb-2"
              >
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 font-roboto ${errors.name ? "border-red-500" : "border-[#EEEEEE]"
                  }`}
                placeholder="Enter category name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 font-roboto">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-bold text-black mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 font-roboto"
                placeholder="Enter category description (optional)"
                disabled={isLoading}
              />
            </div>

            {/* <div>
              <label
                htmlFor="order"
                className="block text-sm font-bold text-black mb-2"
              >
                Display Order
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 font-roboto"
                placeholder="0"
                min="0"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-[#595959] font-roboto">
                Lower numbers appear first
              </p>
            </div> */}

            {/* <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-black border-[#EEEEEE] rounded focus:ring-black"
                disabled={isLoading}
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-black"
              >
                Active
              </label>
            </div> */}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-bold text-[#595959] bg-white border border-[#EEEEEE] rounded-lg hover:bg-[#EEEEEE] transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-black rounded-lg hover:bg-[#595959] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Form Component
interface FormValues {
  title: string;
  type: "residential" | "commercial";
  categoryId: string;
  canvaUrl: string;
  previewFiles: File[];
}

interface Template {
  id: string;
  title: string;
  type: "residential" | "commercial";
  categoryId: string;
  canvaUrl: string;
  previewUrl?: string;
}

interface AddTemplateFormProps {
  mode: "create" | "edit";
  templateId?: string;
  initialTemplate?: Template | null;
}

export default function AddTemplateForm({
  mode,
  templateId,
  initialTemplate,
}: AddTemplateFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const categories = useAppSelector(selectCategoryItems);
  console.log("categories", categories)
  const categoriesLoading = useAppSelector(selectCategoryLoading);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  console.log("previewU", previewImages)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const isEdit = mode === "edit";

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("Template title is required")
      .trim()
      .min(3, "Title must be at least 3 characters"),
    categoryId: Yup.string().required("Category is required"),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      title: "",
      type: "residential",
      categoryId: "",
      canvaUrl: "",
      previewFiles: [],
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isEdit && templateId) {
          const fd = new FormData();
          fd.append("title", values.title.trim());
          fd.append("type", values.type);
          fd.append("categoryId", values.categoryId);
          const firstFile = values.previewFiles[0];
          if (firstFile) {
            fd.append("previewUrl", firstFile);
          }
          await dispatch(
            updateTemplateAsync({ id: templateId, data: fd })
          ).unwrap();
        } else {
          const files = values.previewFiles;
          if (!files.length) throw new Error("No files selected");
          const fd = new FormData();
          fd.append("titlePrefix", values.title.trim());
          fd.append("type", values.type);
          fd.append("categoryId", values.categoryId);
          fd.append("canvaUrl", values.canvaUrl);
          files.forEach((file) => {
            fd.append("previewUrl", file);
          });
          await dispatch(createTemplateAsync(fd)).unwrap();
        }
        router.push("/dashboard/admin/templates/template");
      } catch (error) {
        console.error(
          isEdit ? "Failed to update template:" : "Failed to create templates:",
          error
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!isEdit || !initialTemplate) return;

    // Try to get id directly
    let categoryId = initialTemplate.categoryId || "";

    // If id is missing but name exists, match by name
    if (!categoryId && (initialTemplate as any).category && categories.length) {
      const match = categories.find(
        (c) =>
          c.name.toLowerCase() ===
          (initialTemplate as any).category.toLowerCase()
      );
      if (match) {
        categoryId = match.id;
      }
    }

    formik.setValues({
      title: initialTemplate.title || "",
      type: initialTemplate.type || "residential",
      categoryId,
      canvaUrl: initialTemplate.canvaUrl || "",
      previewFiles: [],
    });

    if (initialTemplate.previewUrl) {
      setPreviewImages([initialTemplate.previewUrl]);
    }
  }, [isEdit, initialTemplate, categories]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(event.target.files || []);
    formik.setFieldValue("previewFiles", fileList);
    const readers: Promise<string>[] = fileList
      .slice(0, 4)
      .map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      );
    Promise.all(readers).then((urls) => setPreviewImages(urls));
  };

  const removePreview = () => {
    formik.setFieldValue("previewFiles", []);
    setPreviewImages([]);
  };

  const handleTypeChange = (type: "residential" | "commercial") => {
    formik.setFieldValue("type", type);
    formik.setFieldValue("categoryId", "");
  };

  const handleBack = () => {
    router.push("/dashboard/admin/templates/template");
  };

  const handleAddCategorySuccess = () => {
    dispatch(fetchCategoriesAsync());
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#EEEEEE]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&display=swap');
          .font-manrope { font-family: 'Manrope', sans-serif; }
          .font-roboto { font-family: 'Roboto', sans-serif; }
        `}</style>

        <div className="p-6 lg:p-8">
          <div className="w-full mx-auto">
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
                {isEdit ? "Edit Template" : "Add New Template"}
              </h1>
              <p
                className="text-base text-[#595959] font-roboto"
                style={{ fontWeight: 400 }}
              >
                {isEdit
                  ? "Update this marketing template for agents"
                  : "Create one or more marketing templates for agents"}
              </p>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 mb-6">
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
                      onClick={() => handleTypeChange("residential")}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-manrope transition-all ${formik.values.type === "residential"
                          ? "bg-black text-white shadow-sm"
                          : "text-[#595959] hover:text-black"
                        }`}
                      style={{ fontWeight: 700 }}
                    >
                      <FileText className="w-4 h-4" />
                      Residential
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange("commercial")}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-manrope transition-all ${formik.values.type === "commercial"
                          ? "bg-black text-white shadow-sm"
                          : "text-[#595959] hover:text-black"
                        }`}
                      style={{ fontWeight: 700 }}
                    >
                      <Building2 className="w-4 h-4" />
                      Commercial
                    </button>
                  </div>
                </div>

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
                    placeholder="Base title for this batch"
                    className={`w-full px-4 py-3 border rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10 ${formik.touched.title && formik.errors.title
                        ? "border-red-500"
                        : "border-[#EEEEEE]"
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

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="categoryId"
                      className="block text-sm text-black font-manrope"
                      style={{ fontWeight: 700 }}
                    >
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddCategoryModalOpen(true)}
                      className="inline-flex items-center gap-1 text-sm text-black hover:text-[#595959] font-manrope transition-colors"
                      style={{ fontWeight: 700 }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Category
                    </button>
                  </div>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formik.values.categoryId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={categoriesLoading}
                    className={`w-full px-4 py-3 border rounded-lg text-sm font-roboto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10 ${formik.touched.categoryId && formik.errors.categoryId
                        ? "border-red-500"
                        : "border-[#EEEEEE]"
                      }`}
                    style={{ fontWeight: 400 }}
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Loading categories..."
                        : "Select a category"}
                    </option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.categoryId && formik.errors.categoryId && (
                    <p
                      className="text-sm text-red-600 font-roboto mt-1"
                      style={{ fontWeight: 400 }}
                    >
                      {formik.errors.categoryId}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    className="block text-sm text-black font-manrope mb-2"
                    style={{ fontWeight: 700 }}
                  >
                    Preview Images *
                  </label>

                  {!previewImages.length ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-[#EEEEEE]/50 transition-colors ${formik.touched.previewFiles && formik.errors.previewFiles
                          ? "border-red-500"
                          : "border-[#EEEEEE]"
                        }`}
                    >
                      <input
                        type="file"
                        id="preview"
                        name="previewUrl"
                        accept="image/*"
                        multiple
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
                          Click to upload one or more images
                        </p>
                        <p
                          className="text-xs text-[#595959] font-roboto"
                          style={{ fontWeight: 400 }}
                        >
                          PNG, JPG up to 5MB each
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

                      <div className="flex items-center gap-4">
                        {previewImages[0] && (
                          <img
                            src={previewImages[0]}
                            alt="Preview"
                            className="w-40 h-40 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p
                            className="text-sm font-roboto text-black mb-1"
                            style={{ fontWeight: 500 }}
                          >
                          
                            selected
                          </p>
                          <p
                            className="text-xs text-[#595959] font-roboto"
                            style={{ fontWeight: 400 }}
                          >
                            Only the first image is shown here. All selected images
                            will be uploaded and one template will be created per
                            image.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formik.touched.previewFiles && formik.errors.previewFiles && (
                    <p
                      className="text-sm text-red-600 font-roboto mt-1"
                      style={{ fontWeight: 400 }}
                    >
                      {formik.errors.previewFiles as string}
                    </p>
                  )}
                </div>
              </div>

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
                  // disabled={formik.isSubmitting || !formik.isValid}
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-manrope hover:bg-[#595959] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 700 }}
                >
                  {formik.isSubmitting ? (
                    <LoadingOverlay isVisible />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {isEdit ? "Update Template" : "Create Templates"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Add Category Modal */}
        <AddCategoryModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onSuccess={handleAddCategorySuccess}
        />
      </div>
    </DashboardLayout>
  );
}