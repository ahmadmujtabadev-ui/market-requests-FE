import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Upload, X, FileText, Image, Film, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/router';

type Template = {
  id: string;
  title: string;
  category: string;
  type: 'residential' | 'commercial';
};

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
};

// Dummy templates - replace with actual API call
const DUMMY_TEMPLATES: Template[] = [
  { id: '1', title: 'Buyer Guide Template', category: 'Guides', type: 'residential' },
  { id: '2', title: 'Property Brochure', category: 'Property Brochures', type: 'residential' },
  { id: '3', title: 'Just Listed', category: 'Just Listed', type: 'residential' },
  { id: '4', title: 'For Sale Template', category: 'For Sale', type: 'commercial' },
  { id: '5', title: 'For Lease Template', category: 'For Lease', type: 'commercial' },
];

export default function SubmitRequestPage() {
  const router = useRouter();
  const { templateId } = router.query;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [projectTitle, setProjectTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Load templates
  useEffect(() => {
    setTemplates(DUMMY_TEMPLATES);
  }, []);

  // Pre-select template if coming from template library
  useEffect(() => {
    if (templateId && typeof templateId === 'string') {
      setSelectedTemplateId(templateId);
    }
  }, [templateId]);

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

  const isFormValid = selectedTemplateId && projectTitle.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      const requestData = {
        templateId: selectedTemplateId,
        projectTitle: projectTitle.trim(),
        notes: notes.trim() || undefined,
        files: files,
      };

      console.log('Submitting request:', requestData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);

      // Reset form after short delay
      setTimeout(() => {
        router.push('/dashboard/agent/requests');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit request. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/agent/templates');
  };

  if (success) {
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

        <div className="flex-1 overflow-auto bg-[#EEEEEE] flex items-center justify-center p-6">
          <div className="bg-white rounded-lg border border-[#EEEEEE] p-8 max-w-md w-full text-center">
            <CheckCircle className="w-16 h-16 text-black mx-auto mb-4" />
            <h2 className="text-2xl text-black font-manrope mb-2" style={{ fontWeight: 800 }}>
              Request Submitted!
            </h2>
            <p className="text-base text-[#595959] font-roboto mb-6" style={{ fontWeight: 400 }}>
              Your marketing request has been sent to the VA team. You'll be notified once work begins.
            </p>
            <button
              onClick={() => router.push('/dashboard/agent/requests')}
              className="w-full bg-black text-white px-6 py-3 rounded-lg font-manrope hover:bg-[#595959] transition-all"
              style={{ fontWeight: 700 }}
            >
              View My Requests
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

      <div className="flex-1 overflow-auto bg-[#EEEEEE]">
        {/* Form Content */}
        <div className="p-6 lg:p-8 pb-40">
          {/* Error Message */}
          {error && (
            <div className="max-w-4xl mx-auto mb-6 bg-white rounded-lg border-2 border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm text-red-900 font-manrope mb-1" style={{ fontWeight: 700 }}>
                  Submission Error
                </h4>
                <p className="text-sm text-red-700 font-roboto" style={{ fontWeight: 400 }}>
                  {error}
                </p>
              </div>
            </div>
          )}

          <div className="w-full mx-auto space-y-6">
            {/* Template Selection */}
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
              <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                Select Template <span className="text-red-600">*</span>
              </label>
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

            {/* Project Title */}
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

            {/* Instructions/Notes */}
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
              <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                Instructions / Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide any specific instructions, requirements, or details for the VA team..."
                rows={6}
                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                style={{ fontWeight: 400 }}
              />
              <p className="mt-2 text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                Include property details, special requests, branding requirements, etc.
              </p>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
              <label className="block text-sm text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                Upload Files
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging
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
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#EEEEEE] bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-6 lg:px-3 py-1 sm:py-1">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-black text-black rounded-lg text-sm font-manrope hover:bg-[#EEEEEE] transition-all disabled:opacity-50"
                style={{ fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className={`inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-manrope transition-all ${
                  isFormValid && !isSubmitting
                    ? 'bg-black text-white hover:bg-[#595959]'
                    : 'bg-[#595959]/50 text-white cursor-not-allowed'
                }`}
                style={{ fontWeight: 700 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}