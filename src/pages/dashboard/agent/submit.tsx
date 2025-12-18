/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image, Film } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts';
import { fetchTemplatesAsync } from '@/services/template/asyncThunk';
import { createRequestAsync } from '@/services/request/asyncThunk';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { selectTemplateItems } from '@/redux/slices/templateSlice';
import { selectRequestLoading } from '@/redux/slices/requestSlice';
import { useRouter } from 'next/router';
import Toast from '@/components/Toast';

type UploadedFile = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
};

export default function SubmitRequestPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const templates = useAppSelector(selectTemplateItems);
  const isSubmitting = useAppSelector(selectRequestLoading);

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [otherPlatform, setOtherPlatform] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const filesRef = useRef<UploadedFile[]>([]);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const searchParams = useSearchParams();

  // ===== File validation (20MB per file) =====
  const MAX_FILE_SIZE_MB = 25;
  const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // 20 MiB in bytes

  const ALLOWED_FILE_TYPES = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    videos: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  };

  const ALLOWED_EXTENSIONS = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'mp4',
    'mov',
    'avi',
    'mkv',
    'pdf',
    'doc',
    'docx',
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileExtension = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return ext;
  };

  const isAllowedType = (file: File) => {
    const allAllowedTypes = [
      ...ALLOWED_FILE_TYPES.images,
      ...ALLOWED_FILE_TYPES.videos,
      ...ALLOWED_FILE_TYPES.documents,
    ];

    // Prefer MIME type
    if (file.type && allAllowedTypes.includes(file.type)) return true;

    // Fallback to extension
    const ext = getFileExtension(file.name);
    return ALLOWED_EXTENSIONS.includes(ext);
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file) return { valid: false, error: 'Invalid file.' };

    if (file.size === 0) {
      return { valid: false, error: `"${file.name}" is empty and cannot be uploaded.` };
    }

    // IMPORTANT: this is the 20MB rule
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit (${formatFileSize(file.size)}).`,
      };
    }

    if (!isAllowedType(file)) {
      return {
        valid: false,
        error: `"${file.name}" has an unsupported file type. Upload images, videos, PDFs, or Word documents.`,
      };
    }

    return { valid: true };
  };

  const isDuplicate = (a: File, b: File) =>
    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

  // ===== Data fetching =====
  useEffect(() => {
    dispatch(fetchTemplatesAsync());
  }, [dispatch]);

  useEffect(() => {
    const templateIdFromUrl = searchParams.get('templateId');
    if (templateIdFromUrl) setSelectedTemplateId(templateIdFromUrl);
  }, [searchParams]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // ===== File selection =====
  const handleFileSelect = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const existing = filesRef.current;
    const incoming = Array.from(fileList);

    const validFiles: UploadedFile[] = [];
    const errors: string[] = [];

    for (const file of incoming) {
      const alreadyAdded = existing.some((f) => isDuplicate(f.file, file)) || validFiles.some((f) => isDuplicate(f.file, file));
      if (alreadyAdded) {
        errors.push(`"${file.name}" is already added.`);
        continue;
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        if (validation.error) errors.push(validation.error);
        continue;
      }

      validFiles.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type?.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      });
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      Toast.fire(
        `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} uploaded successfully`
      );
    }

    if (errors.length > 0) {
      errors.forEach((msg) => Toast.fire(msg));
    }

    if (validFiles.length === 0 && errors.length > 0) {
      Toast.fire('No valid files were uploaded');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const removeFile = (fileId: string) => {
    const fileToRemove = filesRef.current.find((f) => f.id === fileId);
    if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);

    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (fileToRemove) Toast.fire(`"${fileToRemove.name}" removed`);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Film className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const canProceedToStep2 = selectedTemplateId && projectTitle.trim() !== '';
  const canProceedToStep3 = deadline && platforms.length > 0;
  const isFormValid = Boolean(canProceedToStep2 && canProceedToStep3 && confirmed);

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2) setCurrentStep(2);
    else if (currentStep === 2 && canProceedToStep3) setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid || isSubmitting) return;

    // Validate again before submission (20MB rule)
    const currentFiles = filesRef.current;
    const invalid = currentFiles
      .map((f) => ({ f, v: validateFile(f.file) }))
      .filter((x) => !x.v.valid);

    if (invalid.length > 0) {
      Toast.fire(invalid[0].v.error || 'Please remove invalid files before submitting');
      return;
    }

    try {
      const finalPlatforms = platforms.includes('Other')
        ? [...platforms.filter((p) => p !== 'Other'), otherPlatform.trim()].filter(Boolean)
        : platforms;

      const formData = new FormData();
      formData.append('templateId', selectedTemplateId);
      formData.append('projectTitle', projectTitle.trim());
      formData.append('deadline', deadline);
      formData.append('platforms', JSON.stringify(finalPlatforms));

      if (dimensions.trim()) formData.append('dimensions', dimensions.trim());
      if (notes.trim()) formData.append('notes', notes.trim());

      currentFiles.forEach((f) => {
        formData.append('files', f.file);
      });

      await dispatch(createRequestAsync(formData as any)).unwrap();

      Toast.fire('Request submitted successfully!');
      router.push('/dashboard/agent/overview');
    } catch (err: any) {
      // If you see "File too large" here, it is 99% backend/proxy limit.
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to submit request. Please try again.';

      setError(errorMessage);
      Toast.fire(errorMessage);
    }
  };

  // Cleanup image object URLs
  useEffect(() => {
    return () => {
      filesRef.current.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FAFAFA] pb-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
              Submit New Request
            </h1>
            <p className="text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
              Fill in the details below to submit your design request
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep >= 1 ? 'bg-black text-white' : 'bg-[#EEEEEE] text-[#595959]'
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  1
                </div>
                <div
                  className={`text-xs text-center ${
                    currentStep >= 1 ? 'text-black' : 'text-[#595959]'
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  Template & Details
                </div>
                <div className="text-xs text-[#595959] text-center font-roboto mt-1">
                  Select template and project info
                </div>
              </div>

              <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 2 ? 'bg-black' : 'bg-[#EEEEEE]'}`} />

              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep >= 2 ? 'bg-black text-white' : 'bg-[#EEEEEE] text-[#595959]'
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  2
                </div>
                <div
                  className={`text-xs text-center ${
                    currentStep >= 2 ? 'text-black' : 'text-[#595959]'
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  Timeline & Usage
                </div>
                <div className="text-xs text-[#595959] text-center font-roboto mt-1">
                  Specify deadline and platform
                </div>
              </div>

              <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 3 ? 'bg-black' : 'bg-[#EEEEEE]'}`} />

              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep >= 3 ? 'bg-black text-white' : 'bg-[#EEEEEE] text-[#595959]'
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  3
                </div>
                <div
                  className={`text-xs text-center ${
                    currentStep >= 3 ? 'text-black' : 'text-[#595959]'
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  Review & Submit
                </div>
                <div className="text-xs text-[#595959] text-center font-roboto mt-1">
                  Upload files and submit
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <>
                  <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 mb-6">
                    <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                      Select Template <span className="text-red-600">*</span>
                    </label>
                    {/* <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                      style={{ fontWeight: 400 }}
                      required
                    >
                      <option value="">Choose a template...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.title} ({template.category})
                        </option>
                      ))}
                    </select> */}

                    {selectedTemplate && (
                      <div className="mt-4 p-4 bg-[#FAFAFA] rounded-lg">
                        <p className="text-xs text-[#595959] font-roboto mb-2" style={{ fontWeight: 700 }}>
                          {selectedTemplate.type === 'residential' ? 'Residential' : 'Commercial'} • {selectedTemplate.category}
                        </p>
                        <p className="text-sm text-black font-roboto" style={{ fontWeight: 400 }}>
                          {/* {selectedTemplate.description || 'No description available'} */}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                    <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                      Project Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g., 123 Main Street Listing Brochure"
                      className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                      style={{ fontWeight: 400 }}
                      required
                    />
                    <p className="mt-2 text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                      Give your project a clear, descriptive title
                    </p>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                    <h2 className="text-lg text-black font-manrope mb-1" style={{ fontWeight: 700 }}>
                      TIMELINE & USAGE
                    </h2>
                    <p className="text-sm text-[#595959] font-roboto mb-6" style={{ fontWeight: 400 }}>
                      Specify when you need this and where you will use it
                    </p>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                          When do you need it by? <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                          style={{ fontWeight: 400 }}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                          Where will you use this template? <span className="text-red-600">*</span>
                        </label>
                        <div className="space-y-3">
                          {['Instagram Feed', 'Instagram Story', 'Facebook', 'Flyer/Print', 'Email/Newsletter'].map((option) => (
                            <label key={option} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={platforms.includes(option)}
                                onChange={() => togglePlatform(option)}
                                className="w-4 h-4 border-2 border-[#595959] rounded focus:ring-2 focus:ring-black/10"
                              />
                              <span className="ml-2 text-sm text-black font-roboto" style={{ fontWeight: 400 }}>
                                {option}
                              </span>
                            </label>
                          ))}

                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={platforms.includes('Other')}
                              onChange={() => togglePlatform('Other')}
                              className="w-4 h-4 border-2 border-[#595959] rounded focus:ring-2 focus:ring-black/10"
                            />
                            <span className="ml-2 text-sm text-black font-roboto" style={{ fontWeight: 400 }}>
                              Other:
                            </span>
                            <input
                              type="text"
                              value={otherPlatform}
                              onChange={(e) => setOtherPlatform(e.target.value)}
                              disabled={!platforms.includes('Other')}
                              className="ml-2 flex-1 px-2 py-1 border-b border-[#595959] text-sm font-roboto focus:outline-none focus:border-black disabled:opacity-50"
                              style={{ fontWeight: 400 }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                          Specify dimensions (if needed)
                        </label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          placeholder="e.g., 1080x1080, 8.5x11 inches"
                          className="w-full px-4 py-3 border-b border-[#595959] text-sm font-roboto focus:outline-none focus:border-black"
                          style={{ fontWeight: 400 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <>
                  <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 mb-6">
                    <h2 className="text-lg text-black font-manrope mb-1" style={{ fontWeight: 700 }}>
                      APPROVAL & NOTES
                    </h2>
                    <p className="text-sm text-[#595959] font-roboto mb-6" style={{ fontWeight: 400 }}>
                      Add any additional instructions or requirements
                    </p>

                    <div>
                      <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                        Any additional notes or instructions?
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Include any specific requirements, brand guidelines, or special requests..."
                        rows={4}
                        className="w-full px-4 py-3 border-b border-[#595959] text-sm font-roboto focus:outline-none focus:border-black resize-none"
                        style={{ fontWeight: 400 }}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 mb-6">
                    <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                      Upload Files
                    </label>

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                        isDragging ? 'border-black bg-[#EEEEEE]' : 'border-[#595959]/30 hover:border-[#595959]/50'
                      }`}
                    >
                      <Upload className="w-12 h-12 text-[#595959] mx-auto mb-4" />
                      <p className="text-sm text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
                        Drag and drop files here
                      </p>
                      <p className="text-sm text-[#595959] font-roboto mb-4" style={{ fontWeight: 400 }}>
                        or
                      </p>

                      <label className="inline-block">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*,.pdf,.doc,.docx"
                          onChange={(e) => {
                            handleFileSelect(e.target.files);
                            e.currentTarget.value = '';
                          }}
                          className="hidden"
                        />
                        <span
                          className="inline-flex items-center px-6 py-2.5 bg-black text-white rounded-lg text-sm font-manrope hover:bg-[#595959] transition-all cursor-pointer"
                          style={{ fontWeight: 700 }}
                        >
                          Browse Files
                        </span>
                      </label>

                      <p className="mt-4 text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                        Support for images, and documents (Max {MAX_FILE_SIZE_MB}MB per file)
                      </p>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-black font-manrope" style={{ fontWeight: 700 }}>
                            Uploaded Files ({files.length})
                          </p>
                          <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                            Total: {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                          </p>
                        </div>

                        {files.map((file) => (
                          <div key={file.id} className="flex items-center gap-3 p-3 bg-[#EEEEEE] rounded-lg">
                            {file.preview ? (
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="w-12 h-12 rounded object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-[#595959] flex-shrink-0">
                                {getFileIcon(file.type)}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-black font-roboto truncate" style={{ fontWeight: 500 }}>
                                {file.name}
                              </p>
                              <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                                {formatFileSize(file.size)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4 text-[#595959]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                    <label className="block text-sm text-black font-roboto mb-3" style={{ fontWeight: 500 }}>
                      Confirm Submission <span className="text-red-600">*</span>
                    </label>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="w-4 h-4 mt-0.5 border-2 border-[#595959] rounded focus:ring-2 focus:ring-black/10"
                        required
                      />
                      <span className="ml-2 text-sm text-black font-roboto" style={{ fontWeight: 400 }}>
                        I confirm that all details are correct and understand that turnaround time may vary based on request volume
                      </span>
                    </label>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#EEEEEE] bg-white shadow-lg">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2.5 border border-[#EEEEEE] text-black rounded-lg text-sm font-manrope hover:bg-[#FAFAFA] transition-all"
                    style={{ fontWeight: 700 }}
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && !canProceedToStep2) ||
                      (currentStep === 2 && !canProceedToStep3)
                    }
                    className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-manrope hover:bg-[#595959] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontWeight: 700 }}
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-manrope hover:bg-[#595959] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ fontWeight: 700 }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30 max-w-md w-full mx-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-roboto" style={{ fontWeight: 500 }}>
                    {error}
                  </p>
                </div>
                <button onClick={() => setError(null)} className="flex-shrink-0 text-red-600 hover:text-red-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
