/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { JSX, useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts';
import {
  ArrowLeft,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  X,
  Loader2,
  UploadCloud,
  User,
  Layers,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import {
  fetchRequestByIdAsync,
  updateRequestStatusAsync,
  uploadCompletedFileAsync,
} from '@/services/request/asyncThunk';
import {
  selectSelectedRequest,
  selectRequestLoading,
} from '@/redux/slices/requestSlice';
import type { RequestStatus } from '@/services/request/endpoint';
import { LoadingOverlay } from '@/components/loaders/overlayloader';

const STATUS_CONFIG: Record<
  RequestStatus,
  {
    label: string;
    bgColor: string;
    textColor: string;
    icon: JSX.Element;
  }
> = {
  new: {
    label: 'New',
    bgColor: 'bg-[#EEEEEE]',
    textColor: 'text-black',
    icon: <Clock className="w-5 h-5" />,
  },
  progress: {
    label: 'In Progress',
    bgColor: 'bg-black',
    textColor: 'text-white',
    icon: <FileText className="w-5 h-5" />,
  },
  revision: {
    label: 'Revision Needed',
    bgColor: 'bg-[#595959]',
    textColor: 'text-white',
    icon: <AlertCircle className="w-5 h-5" />,
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-black',
    textColor: 'text-white',
    icon: <CheckCircle className="w-5 h-5" />,
  },
};

const STATUS_ORDER: RequestStatus[] = [
  'new',
  'progress',
  'revision',
  'completed',
];

function StatusBadge({ status }: { status: RequestStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${config.bgColor} ${config.textColor}`}
    >
      {config.icon}
      <span className="text-base font-manrope" style={{ fontWeight: 700 }}>
        {config.label}
      </span>
    </div>
  );
}

export default function VaRequestDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = router.query;

  const request = useSelector(selectSelectedRequest);
  const isLoading = useSelector(selectRequestLoading);

  const [localStatus, setLocalStatus] = useState<RequestStatus | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchRequestByIdAsync(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (request) {
      setLocalStatus(request.status);
      setSelectedFile(null);
    }
  }, [request]);

  const getFileName = (url: string) => {
    try {
      return url.split('/').pop() || 'file';
    } catch {
      return 'file';
    }
  };

  const handleStatusSave = async () => {
    if (!request || !localStatus || localStatus === request.status) return;
    setStatusSaving(true);
    try {
      await dispatch(
        updateRequestStatusAsync({ id: request.id, status: localStatus })
      ).unwrap();
      // Refresh request data
      dispatch(fetchRequestByIdAsync(request.id));
    } catch (e: any) {
        console.log(e)
    } finally {
      setStatusSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !request) return;
    setUploading(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileType', 'va_completed');

      await dispatch(
        uploadCompletedFileAsync({
          id: request.id,
          formData,
        })
      ).unwrap();

      // Refresh request data
      dispatch(fetchRequestByIdAsync(request.id));
      setSelectedFile(null);
    } catch (e: any) {
        console.log(e)
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingOverlay isVisible />
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout>
        <div className="flex-1 overflow-auto bg-[#EEEEEE] p-6 lg:p-8">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <FileText className="w-12 h-12 text-[#595959] mx-auto mb-4" />
                <p
                  className="text-sm text-[#595959] font-roboto"
                  style={{ fontWeight: 400 }}
                >
                  Request not found
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const agentFiles =
    request.files?.filter((f) => f.fileType === 'agent_upload') || [];
  const completedFiles =
    request.files?.filter((f) => f.fileType === 'va_completed') || [];

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
          <button
            onClick={() => router.push('/dashboard/va/requests')}
            className="inline-flex items-center gap-2 text-[#595959] hover:text-black mb-6 font-roboto transition-colors"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Work Queue
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1
                  className="text-3xl text-black font-manrope mb-3"
                  style={{ fontWeight: 800 }}
                >
                  {request.projectTitle}
                </h1>
                <div className="flex items-center gap-3 flex-wrap text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  <span>Request ID: {request.id.substring(0, 12)}...</span>
                  {request.template && (
                    <>
                      <span>•</span>
                      <span>{request.template.category}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>
                    Created {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update Section */}
            <div className="bg-[#EEEEEE] rounded-lg p-6">
              <label
                className="block text-sm text-black font-manrope mb-3"
                style={{ fontWeight: 700 }}
              >
                Update Status
              </label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setLocalStatus(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-manrope border-2 transition-all ${
                        localStatus === s
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-[#595959] border-[#EEEEEE] hover:border-black/30'
                      }`}
                      style={{ fontWeight: 700 }}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStatusSave}
                    disabled={
                      statusSaving ||
                      !localStatus ||
                      localStatus === request.status
                    }
                    className={`inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-manrope border-2 border-black ${
                      statusSaving ||
                      !localStatus ||
                      localStatus === request.status
                        ? 'bg-[#EEEEEE] text-[#595959] cursor-not-allowed'
                        : 'bg-black text-white hover:bg-[#595959]'
                    } transition-colors`}
                    style={{ fontWeight: 700 }}
                  >
                    {statusSaving && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save Status
                  </button>
                  <div className="flex items-center gap-2 text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                    Current: <StatusBadge status={request.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Agent Info */}
              {request.agent && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-[#595959]" />
                    <h2
                      className="text-lg text-black font-manrope"
                      style={{ fontWeight: 700 }}
                    >
                      Agent Information
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p
                        className="text-xs text-[#595959] font-roboto mb-1"
                        style={{ fontWeight: 400 }}
                      >
                        Name
                      </p>
                      <p
                        className="text-sm text-black font-roboto"
                        style={{ fontWeight: 500 }}
                      >
                        {request.agent.name}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs text-[#595959] font-roboto mb-1"
                        style={{ fontWeight: 400 }}
                      >
                        Email
                      </p>
                      <p
                        className="text-sm text-black font-roboto"
                        style={{ fontWeight: 500 }}
                      >
                        {request.agent.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Info */}
              {request.template && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-[#595959]" />
                    <h2
                      className="text-lg text-black font-manrope"
                      style={{ fontWeight: 700 }}
                    >
                      Template Used
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p
                        className="text-xs text-[#595959] font-roboto mb-1"
                        style={{ fontWeight: 400 }}
                      >
                        Title
                      </p>
                      <p
                        className="text-sm text-black font-roboto"
                        style={{ fontWeight: 500 }}
                      >
                        {request.template.title}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs text-[#595959] font-roboto mb-1"
                        style={{ fontWeight: 400 }}
                      >
                        Category
                      </p>
                      <span
                        className="inline-block px-2 py-1 bg-[#EEEEEE] text-[#595959] rounded text-xs font-roboto"
                        style={{ fontWeight: 500 }}
                      >
                        {request.template.category}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Deadline */}
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#595959]" />
                  <h2
                    className="text-lg text-black font-manrope"
                    style={{ fontWeight: 700 }}
                  >
                    Deadline
                  </h2>
                </div>
                <p
                  className="text-base text-black font-roboto"
                  style={{ fontWeight: 500 }}
                >
                  {new Date(request.deadline).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                <h2
                  className="text-lg text-black font-manrope mb-4"
                  style={{ fontWeight: 700 }}
                >
                  Timeline
                </h2>
                <div className="space-y-4">
                  <div>
                    <p
                      className="text-xs text-[#595959] font-roboto mb-1"
                      style={{ fontWeight: 400 }}
                    >
                      Created At
                    </p>
                    <p
                      className="text-sm text-black font-roboto"
                      style={{ fontWeight: 500 }}
                    >
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs text-[#595959] font-roboto mb-1"
                      style={{ fontWeight: 400 }}
                    >
                      Last Updated
                    </p>
                    <p
                      className="text-sm text-black font-roboto"
                      style={{ fontWeight: 500 }}
                    >
                      {new Date(request.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Platforms */}
              {request.platforms && request.platforms.length > 0 && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h2
                    className="text-lg text-black font-manrope mb-4"
                    style={{ fontWeight: 700 }}
                  >
                    Target Platforms
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {request.platforms.map((platform, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-[#EEEEEE] text-black rounded-lg text-sm font-roboto"
                        style={{ fontWeight: 500 }}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dimensions */}
              {request.dimensions && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h2
                    className="text-lg text-black font-manrope mb-4"
                    style={{ fontWeight: 700 }}
                  >
                    Dimensions
                  </h2>
                  <p
                    className="text-base text-black font-roboto"
                    style={{ fontWeight: 500 }}
                  >
                    {request.dimensions}
                  </p>
                </div>
              )}

              {/* Instructions */}
              {request.notes && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h2
                    className="text-lg text-black font-manrope mb-4"
                    style={{ fontWeight: 700 }}
                  >
                    Instructions / Notes
                  </h2>
                  <div className="p-4 bg-[#EEEEEE] rounded-lg">
                    <p
                      className="text-sm text-[#595959] font-roboto whitespace-pre-wrap"
                      style={{ fontWeight: 400 }}
                    >
                      {request.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Agent Uploaded Files */}
              {agentFiles.length > 0 && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h2
                    className="text-lg text-black font-manrope mb-4"
                    style={{ fontWeight: 700 }}
                  >
                    Agent Files ({agentFiles.length})
                  </h2>
                  <div className="space-y-2">
                    {agentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-[#EEEEEE] rounded-lg hover:bg-[#E0E0E0] transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-[#595959] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm text-black font-roboto truncate"
                              style={{ fontWeight: 500 }}
                            >
                              {getFileName(file.fileUrl)}
                            </p>
                            <p
                              className="text-xs text-[#595959] font-roboto mt-1"
                              style={{ fontWeight: 400 }}
                            >
                              Uploaded{' '}
                              {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0"
                          title="Download file"
                        >
                          <Download className="w-5 h-5 text-[#595959]" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Files */}
              {completedFiles.length > 0 && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h2
                    className="text-lg text-black font-manrope mb-4"
                    style={{ fontWeight: 700 }}
                  >
                    Your Completed Files ({completedFiles.length})
                  </h2>
                  <div className="space-y-2">
                    {completedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-black text-white rounded-lg hover:bg-[#595959] transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <CheckCircle className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-roboto truncate"
                              style={{ fontWeight: 500 }}
                            >
                              {getFileName(file.fileUrl)}
                            </p>
                            <p
                              className="text-xs opacity-70 font-roboto mt-1"
                              style={{ fontWeight: 400 }}
                            >
                              Completed{' '}
                              {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-[#404040] rounded-lg transition-colors flex-shrink-0"
                          title="Download file"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Completed File */}
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                <h2
                  className="text-lg text-black font-manrope mb-4"
                  style={{ fontWeight: 700 }}
                >
                  Upload Completed File
                </h2>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-black bg-[#FAFAFA]'
                      : 'border-[#EEEEEE] bg-white hover:border-black/40'
                  }`}
                >
                  <input
                    id="completed-file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx,.png,.jpg,.jpeg,.mp4"
                  />

                  <label
                    htmlFor="completed-file-input"
                    className="block cursor-pointer"
                  >
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[#EEEEEE] flex items-center justify-center">
                      <UploadCloud className="w-8 h-8 text-[#595959]" />
                    </div>

                    <p
                      className="text-base text-black font-manrope mb-2"
                      style={{ fontWeight: 700 }}
                    >
                      Drag and drop your completed file
                    </p>
                    <p
                      className="text-sm text-[#595959] font-roboto mb-4"
                      style={{ fontWeight: 400 }}
                    >
                      or click to browse and select files
                    </p>

                    <p
                      className="text-xs text-[#595959] font-roboto"
                      style={{ fontWeight: 400 }}
                    >
                      Supported formats: PDF, DOCX, PNG, JPG, MP4
                      <br />
                      Maximum file size: 30MB
                    </p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-4 p-4 bg-[#EEEEEE] rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-[#595959] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm text-black font-roboto truncate"
                            style={{ fontWeight: 500 }}
                          >
                            {selectedFile.name}
                          </p>
                          <p
                            className="text-xs text-[#595959] font-roboto mt-1"
                            style={{ fontWeight: 400 }}
                          >
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-5 h-5 text-[#595959]" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleUploadFile}
                      disabled={uploading}
                      className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-manrope border-2 border-black ${
                        uploading
                          ? 'bg-[#EEEEEE] text-[#595959] cursor-not-allowed'
                          : 'bg-black text-white hover:bg-[#595959]'
                      } transition-colors`}
                      style={{ fontWeight: 700 }}
                    >
                      {uploading && (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Completed File'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}