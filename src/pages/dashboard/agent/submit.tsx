/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useCallback } from 'react';
import { Upload, X, FileText, Image, Film} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts';
import { fetchTemplatesAsync } from '@/services/template/asyncThunk';
import { createRequestAsync } from '@/services/request/asyncThunk';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { selectTemplateItems, selectTemplateLoading } from '@/redux/slices/templateSlice';
import { selectRequestLoading } from '@/redux/slices/requestSlice';
import { useRouter } from 'next/router';

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
};

export default function SubmitRequestPage() {
  const dispatch = useAppDispatch();
  const router = useRouter()
  const templates = useAppSelector(selectTemplateItems);
    console.log("template", templates)
  const isLoadingTemplates = useAppSelector(selectTemplateLoading);
  const isSubmitting = useAppSelector(selectRequestLoading);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [projectTitle, setProjectTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  console.log(error)
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [otherPlatform, setOtherPlatform] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [confirmed, setConfirmed] = useState(false);  
  const searchParams = useSearchParams();

  useEffect(() => {
    dispatch(fetchTemplatesAsync());
  }, [dispatch]);

   useEffect(() => {
    const templateIdFromUrl = searchParams.get('templateId');
    if (templateIdFromUrl) {
      setSelectedTemplateId(templateIdFromUrl);
    }
  }, [searchParams]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const handleFileSelect = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
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
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Film className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const canProceedToStep2 = selectedTemplateId && projectTitle.trim() !== '';
  const canProceedToStep3 = deadline && platforms.length > 0;
  const isFormValid = canProceedToStep2 && canProceedToStep3 && confirmed;

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (isFormValid || isSubmitting) return;
    setError(null);
    try {
      const finalPlatforms = platforms.includes('Other')
        ? [...platforms.filter(p => p !== 'Other'), otherPlatform.trim()]
        : platforms;
      const fileUrls = files.map(f => f.url || f.preview || '');
      const requestData = {
        templateId: selectedTemplateId,
        projectTitle: projectTitle.trim(),
        deadline,
        platforms: finalPlatforms.filter(Boolean),
        dimensions: dimensions.trim() || undefined,
        notes: notes.trim() || undefined,
        fileUrls: fileUrls.filter(Boolean),
      };
      await dispatch(createRequestAsync(requestData)).unwrap();
      router.push('/dashboard/agent/overview')

    } catch (err: any) {
      setError(err?.message || 'Failed to submit request. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#EEEEEE] pb-32">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&display=swap');
        .font-manrope { font-family: 'Manrope', sans-serif; }
        .font-roboto { font-family: 'Roboto', sans-serif; }
      `}</style>

        <div className="bg-white border-b border-[#EEEEEE] px-6 lg:px-8 py-6">
          <div className="w-full mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-manrope transition-all ${currentStep >= 1
                    ? 'bg-black text-white'
                    : 'bg-[#EEEEEE] text-[#595959]'
                  }`} style={{ fontWeight: 700 }}>
                  1
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-manrope ${currentStep >= 1 ? 'text-black' : 'text-[#595959]'
                    }`} style={{ fontWeight: 700 }}>
                    Template & Details
                  </p>
                  <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                    Select template and project info
                  </p>
                </div>
              </div>

              <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 2 ? 'bg-black' : 'bg-[#EEEEEE]'
                }`} />

              <div className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-manrope transition-all ${currentStep >= 2
                    ? 'bg-black text-white'
                    : 'bg-[#EEEEEE] text-[#595959]'
                  }`} style={{ fontWeight: 700 }}>
                  2
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-manrope ${currentStep >= 2 ? 'text-black' : 'text-[#595959]'
                    }`} style={{ fontWeight: 700 }}>
                    Timeline & Usage
                  </p>
                  <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                    Specify deadline and platform
                  </p>
                </div>
              </div>

              <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 3 ? 'bg-black' : 'bg-[#EEEEEE]'
                }`} />

              <div className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-manrope transition-all ${currentStep >= 3
                    ? 'bg-black text-white'
                    : 'bg-[#EEEEEE] text-[#595959]'
                  }`} style={{ fontWeight: 700 }}>
                  3
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-manrope ${currentStep >= 3 ? 'text-black' : 'text-[#595959]'
                    }`} style={{ fontWeight: 700 }}>
                    Review & Submit
                  </p>
                  <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                    Upload files and submit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="w-full mx-auto space-y-6">
            {currentStep === 1 && (
              <>
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                    Select Template <span className="text-red-600">*</span>
                  </label>
                  {isLoadingTemplates ? (
                    <div className="text-sm text-[#595959]">Loading templates...</div>
                  ) : (
                    <select
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
                    </select>
                  )}
                  {selectedTemplate && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                      <span className="inline-block px-2 py-1 bg-[#EEEEEE] rounded text-xs font-manrope" style={{ fontWeight: 600 }}>
                        {selectedTemplate.type === 'residential' ? 'Residential' : 'Commercial'}
                      </span>
                      <span>•</span>
                      <span>{selectedTemplate.category}</span>
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
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                <h3 className="text-lg text-black font-manrope mb-1" style={{ fontWeight: 700 }}>
                  TIMELINE & USAGE
                </h3>
                <p className="text-sm text-[#595959] font-roboto mb-6" style={{ fontWeight: 400 }}>
                  Specify when you need this and where you will use it
                </p>

                <div className="mb-6">
                  <label className="block text-sm text-black font-roboto mb-3" style={{ fontWeight: 500 }}>
                    When do you need it by? <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                    style={{ fontWeight: 400 }}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-black font-roboto mb-3" style={{ fontWeight: 500 }}>
                    Where will you use this template? <span className="text-red-600">*</span>
                  </label>
                  <div className="space-y-2">
                    {['Instagram Feed', 'Instagram Story', 'Facebook', 'Flyer/Print', 'Email/Newsletter'].map((option) => (
                      <label key={option} className="flex items-center">
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
                    <label className="flex items-center">
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
                        placeholder=""
                        disabled={!platforms.includes('Other')}
                        className="ml-2 flex-1 px-2 py-1 border-b border-[#595959] text-sm font-roboto focus:outline-none focus:border-black disabled:opacity-50"
                        style={{ fontWeight: 400 }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-black font-roboto mb-3" style={{ fontWeight: 500 }}>
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
            )}

            {currentStep === 3 && (
              <>
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h3 className="text-lg text-black font-manrope mb-1" style={{ fontWeight: 700 }}>
                    APPROVAL & NOTES
                  </h3>
                  <p className="text-sm text-[#595959] font-roboto mb-4" style={{ fontWeight: 400 }}>
                    Add any additional instructions or requirements
                  </p>

                  <label className="block text-sm text-black font-roboto mb-3" style={{ fontWeight: 500 }}>
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

                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                    Upload Files
                  </label>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging
                        ? 'border-black bg-[#EEEEEE]'
                        : 'border-[#595959]/30 hover:border-[#595959]/50'
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
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                      />
                      <span className="inline-flex items-center px-6 py-2.5 bg-black text-white rounded-lg text-sm font-manrope hover:bg-[#595959] transition-all cursor-pointer" style={{ fontWeight: 700 }}>
                        Browse Files
                      </span>
                    </label>
                    <p className="mt-4 text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                      Support for images, videos, PDFs, and documents
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <p className="text-sm text-black font-manrope" style={{ fontWeight: 700 }}>
                        Uploaded Files ({files.length})
                      </p>
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 bg-[#EEEEEE] rounded-lg"
                        >
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
                    />
                    <span className="ml-2 text-sm text-black font-roboto" style={{ fontWeight: 400 }}>
                      I confirm that all details are correct and understand that turnaround time may vary based on request volume
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#EEEEEE] bg-white shadow-lg">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
              <div className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                Step {currentStep} of 3
              </div>
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-black text-black rounded-lg text-sm font-manrope hover:bg-[#EEEEEE] transition-all disabled:opacity-50"
                    style={{ fontWeight: 700 }}
                  >
                    Back
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={(currentStep === 1 && !canProceedToStep2) || (currentStep === 2 && !canProceedToStep3)}
                    className={`inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-manrope transition-all ${(currentStep === 1 && canProceedToStep2) || (currentStep === 2 && canProceedToStep3)
                        ? 'bg-black text-white hover:bg-[#595959]'
                        : 'bg-[#595959]/50 text-white cursor-not-allowed'
                      }`}
                    style={{ fontWeight: 700 }}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className={`inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-manrope transition-all ${isFormValid && !isSubmitting
                        ? 'bg-black text-white hover:bg-[#595959]'
                        : 'bg-[#595959]/50 text-white cursor-not-allowed'
                      }`}
                    style={{ fontWeight: 700 }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}