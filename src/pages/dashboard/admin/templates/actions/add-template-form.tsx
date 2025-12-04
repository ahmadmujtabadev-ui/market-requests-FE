import React, { useEffect, useState } from "react";
import { ArrowLeft, Upload, X, FileText, Building2, Save } from "lucide-react";
import { DashboardLayout } from "@/components/layouts";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/hooks/hooks";
import { useRouter } from "next/router";
import { createTemplateAsync, updateTemplateAsync } from "@/services/template/asyncThunk";
import { LoadingOverlay } from "@/components/loaders/overlayloader";

const RESIDENTIAL_CATEGORIES = [
  "Guides",
  "Seller Guide",
  "Property Brochures",
  "12 Months Newsletter",
  "Pre-Listing Checklist",
  "Vendor List",
  "Postcard (6*4 inch)",
  "Postcard (6*4 inch) Congratulations",
  "Postcard (6*4 inch) Holiday",
  "Postcard (6*4 inch) Just Listed",
  "Postcard (6*4 inch) Sold",
  "Postcard (6*4 inch) Maintenence",
  "Postcard (6*4 inch) Under Contract",
  "Postcard (6*4 inch) General",
  "Postcard (6*4 inch) Intro",
  "Postcard (6*4 inch) Open House",
  "Postcard (7*5 inch)",
  "Postcard (7*5 inch) Congratulations",
  "Postcard (7*5 inch) Holiday",
  "Postcard (7*5 inch) Just Listed",
  "Postcard (7*5 inch) Sold",
  "Postcard (7*5 inch) Maintenence",
  "Postcard (7*5 inch) Under Contract",
  "Postcard (7*5 inch) General",
  "Postcard (7*5 inch) Intro",
  "Postcard (7*5 inch) Open House",
  "Instagram Posts (1080*1080)",
  "Instagram Posts (1080*1080) About us",
  "Instagram Posts (1080*1080) General",
  "Instagram Posts (1080*1080) Tips",
  "Instagram Posts (1080*1080) Discover",
  "Instagram Posts (1080*1080) Q&A",
  "Instagram Posts (1080*1080) Listing",
  "Instagram Posts (1080*1080) Marketing Updates",
  "Instagram Posts (1080*1080) Open House",
  "Instagram Posts (1080*1080) Testominal",
  "Instagram Stories (1080*1920)",
  "Instagram Stories (1080*1920) General",
  "Instagram Stories (1080*1920) Discover",
  "Instagram Stories (1080*1920) Listing",
  "Instagram Stories (1080*1920) Marketing Updates",
  "Instagram Stories (1080*1920) Open House",
  "Instagram Stories (1080*1920) Testominal",
  "Flyers",
];

const COMMERCIAL_CATEGORIES = [
  "For Sale",
  "For Lease",
  "Sold/Leased",
  "Price Adjustment",
  "Project Announcements",
  "Market Reports",
  "Property Highlights",
  "Broker Branding",
];

interface FormValues {
  title: string;
  type: "residential" | "commercial";
  category: string;
  canvaUrl: string;
  previewFiles: File[];
}

interface Template {
  id: string;
  title: string;
  type: "residential" | "commercial";
  category: string;
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
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const isEdit = mode === "edit";

  const validationSchema = Yup.object({
    title: Yup.string().required("Template title is required").trim().min(3, "Title must be at least 3 characters"),
    category: Yup.string().required("Category is required"),
    // canvaUrl: Yup.string()
    //   .required("Canva URL is required")
    //   .url("Please enter a valid URL")
    //   .matches(/^https?:\/\//, "URL must start with http:// or https://"),
    previewFiles: Yup.array().of(Yup.mixed<File>()).min(1, "Please select at least one image"),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      title: "",
      type: "residential",
      category: "",
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
          fd.append("category", values.category);
          // fd.append("canvaUrl", values.canvaUrl);
          const firstFile = values.previewFiles[0];
          if (firstFile) {
            fd.append("previewUrl", firstFile);
          }
          await dispatch(updateTemplateAsync({ id: templateId, data: fd })).unwrap();
        } else {
          const files = values.previewFiles;
          if (!files.length) throw new Error("No files selected");
          const fd = new FormData();
          fd.append("titlePrefix", values.title.trim());
          fd.append("type", values.type);
          fd.append("category", values.category);
          fd.append("canvaUrl", values.canvaUrl);
          files.forEach((file) => {
            fd.append("previewUrl", file);
          });
          await dispatch(createTemplateAsync(fd)).unwrap();
        }
        router.push("/dashboard/admin/templates/template");
      } catch (error) {
        console.error(isEdit ? "Failed to update template:" : "Failed to create templates:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && initialTemplate) {
      formik.setValues({
        title: initialTemplate.title || "",
        type: initialTemplate.type || "residential",
        category: initialTemplate.category || "",
        canvaUrl: initialTemplate.canvaUrl || "",
        previewFiles: [],
      });
      if (initialTemplate.previewUrl) {
        setPreviewImages([initialTemplate.previewUrl]);
      }
    }
  }, [isEdit, initialTemplate]);

  const categories =
    formik.values.type === "residential" ? RESIDENTIAL_CATEGORIES : COMMERCIAL_CATEGORIES;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(event.target.files || []);
    formik.setFieldValue("previewFiles", fileList);
    const readers: Promise<string>[] = fileList.slice(0, 4).map(
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
    formik.setFieldValue("category", "");
  };

  const handleBack = () => {
    router.push("/dashboard/admin/templates/template");
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
                      ? "border-red-500"
                      : "border-[#EEEEEE]"
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

                {/* <div className="mb-6">
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
                      ? "border-red-500"
                      : "border-[#EEEEEE]"
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
                </div> */}

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
                            {formik.values.previewFiles.length} image
                            {formik.values.previewFiles.length > 1 ? "s" : ""} selected
                          </p>
                          <p
                            className="text-xs text-[#595959] font-roboto"
                            style={{ fontWeight: 400 }}
                          >
                            Only the first image is shown here. All selected images will
                            be uploaded and one template will be created per image.
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
                  disabled={formik.isSubmitting || !formik.isValid}
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
      </div>
    </DashboardLayout>
  );
}
