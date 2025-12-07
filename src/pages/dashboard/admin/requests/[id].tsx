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
  Layers,
  Sparkles,
  Package,
  Loader2, // Import Loader icon
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { fetchRequestByIdAsync } from '@/services/request/asyncThunk';
import { selectSelectedRequest, selectRequestLoading } from '@/redux/slices/requestSlice';
import type { RequestStatus } from '@/services/request/endpoint';
import { LoadingOverlay } from '@/components/loaders/overlayloader';
import { API_ENDPOINT } from '@/config';

// ... STATUS_CONFIG and StatusBadge remain same ...

const STATUS_CONFIG: Record<RequestStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  icon: JSX.Element;
}> = {
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
    label: 'Needs Revision',
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

function isNewFile(createdAt: string): boolean {
  const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
  return new Date(createdAt).getTime() > oneDayAgo;
}

export default function AgentRequestDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = router.query;

  const request = useSelector(selectSelectedRequest);
  const isLoading = useSelector(selectRequestLoading);

  // Loading states for downloads
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchRequestByIdAsync(id));
    }
  }, [dispatch, id]);

  const getFileName = (url: string) => {
    try {
      return url.split('/').pop() || 'file';
    } catch {
      return 'file';
    }
  };

  const handleDownload = async (fileUrl: string, fileId: string) => {
    // Add file to downloading set
    setDownloadingFiles(prev => new Set(prev).add(fileId));

    try {
      const downloadUrl = `${API_ENDPOINT}request/download/file?fileUrl=${encodeURIComponent(fileUrl)}`;
      window.location.href = downloadUrl;

      // Remove from downloading state after a short delay
      setTimeout(() => {
        setDownloadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);

    try {
      for (let i = 0; i < completedFiles.length; i++) {
        const file = completedFiles[i];
        const downloadUrl = `${API_ENDPOINT}request/download/file?fileUrl=${encodeURIComponent(file.fileUrl)}`;

        // Open download in new window with delay
        setTimeout(() => {
          window.open(downloadUrl, '_blank');
        }, i * 1000);
      }

      // Reset loading state after all files are queued
      setTimeout(() => {
        setDownloadingAll(false);
      }, completedFiles.length * 1000 + 1000);
    } catch (error) {
      console.error('Download all failed:', error);
      setDownloadingAll(false);
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
                <Package className="w-16 h-16 text-[#595959] mx-auto mb-4" />
                <h2 className="text-xl text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
                  Request not found
                </h2>
                <p className="text-sm text-[#595959] font-roboto mb-6" style={{ fontWeight: 400 }}>
                  This request may have been deleted or you do not have access to it
                </p>
                <button
                  onClick={() => router.push('/dashboard/agent/requests')}
                  className="bg-black text-white px-6 py-3 rounded-lg font-manrope hover:bg-[#595959] transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  Back to Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const agentFiles = request.files?.filter(f => f.fileType === 'agent_upload') || [];
  const completedFiles = request.files?.filter(f => f.fileType === 'va_completed') || [];
  const newCompletedFiles = completedFiles.filter(f => isNewFile(f.createdAt));

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

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.1) 50%,
            rgba(0, 0, 0, 0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div className="flex-1 overflow-auto bg-[#EEEEEE] p-6 lg:p-8">
        <div className="w-full mx-auto">
          <button
            onClick={() => router.push('/dashboard/agent/requests')}
            className="inline-flex items-center gap-2 text-[#595959] hover:text-black mb-6 font-roboto transition-colors"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to My Requests
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl text-black font-manrope mb-3" style={{ fontWeight: 800 }}>
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
                  <span>Created {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <StatusBadge status={request.status} />
            </div>

            {/* New Updates Banner */}
            {newCompletedFiles.length > 0 && (
              <div className="bg-black text-blue p-4 rounded-lg flex items-center gap-3 shimmer">
                <Sparkles className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-manrope mb-1" style={{ fontWeight: 700 }}>
                    New Completed Files Available!
                  </p>
                  <p className="text-xs opacity-90 font-roboto" style={{ fontWeight: 400 }}>
                    Your VA has delivered {newCompletedFiles.length} new file{newCompletedFiles.length !== 1 ? 's' : ''} for this request
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Keep as is */}
            <div className="lg:col-span-1 space-y-6">
              {/* Template Info */}
              {/* Template Info */}
              {request.template && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-[#595959]" />
                    <h2 className="text-lg text-black font-manrope" style={{ fontWeight: 700 }}>
                      Template Used
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                        Title
                      </p>
                      <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                        {request.template.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                        Category
                      </p>
                      <span className="inline-block px-2 py-1 bg-[#EEEEEE] text-[#595959] rounded text-xs font-roboto" style={{ fontWeight: 500 }}>
                        {request.template.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                        Type
                      </p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-roboto ${request.template.type === 'residential' ? 'bg-black text-white' : 'bg-[#595959] text-white'
                        }`} style={{ fontWeight: 600 }}>
                        {request.template.type}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Preview - Separate Card */}
              {request.template?.previewUrl && (
                <div className="bg-white rounded-lg border-2 p-6 mt-3 shadow-lg">
                  <h2
                    className="text-lg text-black font-manrope mb-4"
                    style={{ fontWeight: 700 }}
                  >
                    Template Preview
                  </h2>
                  <div className="relative w-full bg-gradient-to-br from-[#FAFAFA] to-[#EEEEEE] rounded-lg overflow-hidden border border-[#EEEEEE]">
                    <img
                      src={request.template.previewUrl}
                      alt={request.template.title}
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23EEEEEE" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23595959" font-size="16"%3ENo Preview Available%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                </div>
              )}
              {/* Deadline */}
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#595959]" />
                  <h2 className="text-lg text-black font-manrope" style={{ fontWeight: 700 }}>
                    Deadline
                  </h2>
                </div>
                <p className="text-base text-black font-roboto" style={{ fontWeight: 500 }}>
                  {new Date(request.deadline).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                <h2 className="text-lg text-black font-manrope mb-4" style={{ fontWeight: 700 }}>
                  Timeline
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                      Created At
                    </p>
                    <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                      Last Updated
                    </p>
                    <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
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
                  <h2 className="text-lg text-black font-manrope mb-4" style={{ fontWeight: 700 }}>
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
                  <h2 className="text-lg text-black font-manrope mb-4" style={{ fontWeight: 700 }}>
                    Dimensions
                  </h2>
                  <p className="text-base text-black font-roboto" style={{ fontWeight: 500 }}>
                    {request.dimensions}
                  </p>
                </div>
              )}

              {/* Instructions */}
              {request.notes && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h2 className="text-lg text-black font-manrope mb-4" style={{ fontWeight: 700 }}>
                    Instructions / Notes
                  </h2>
                  <div className="p-4 bg-[#EEEEEE] rounded-lg">
                    <p className="text-sm text-[#595959] font-roboto whitespace-pre-wrap" style={{ fontWeight: 400 }}>
                      {request.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Your Uploaded Files */}
              {agentFiles.length > 0 && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h2 className="text-lg text-black font-manrope mb-4" style={{ fontWeight: 700 }}>
                    Your Uploaded Files ({agentFiles.length})
                  </h2>
                  <div className="space-y-2">
                    {agentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-[#EEEEEE] rounded-lg hover:bg-[#E0E0E0] transition-colors"
                      >
                        {/* Left side: file info */}
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
                              Uploaded {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Right side: download button */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleDownload(file.fileUrl, file.id)}
                            // disabled={isDownloading}
                            // className={`bg-black text-white px-4 py-2 rounded-lg font-manrope hover:bg-[#595959] transition-colors flex items-center gap-2 ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''
                            //   }`}
                            style={{ fontWeight: 700 }}
                          >
                            {/* {isDownloading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Download
                              </>
                            )} */}
                            Download
                          </button>
                        </div>
                      </div>

                    ))}
                  </div>
                </div>
              )}

              {/* COMPLETED FILES - WITH LOADING STATE */}
              {completedFiles.length > 0 ? (
                <div className="bg-gradient-to-br from-black to-[#595959] rounded-lg border-2 border-black p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-white rounded-full p-2">
                        <CheckCircle className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h2 className="text-xl text-white font-manrope" style={{ fontWeight: 800 }}>
                          Completed Work from VA
                        </h2>
                        <p className="text-sm text-white/80 font-roboto mt-1" style={{ fontWeight: 400 }}>
                          {completedFiles.length} file{completedFiles.length !== 1 ? 's' : ''} ready for download
                        </p>
                      </div>
                    </div>
                    {newCompletedFiles.length > 0 && (
                      <div className="bg-green-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-manrope" style={{ fontWeight: 700 }}>
                          {newCompletedFiles.length} New
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {completedFiles.map((file) => {
                      const isNew = isNewFile(file.createdAt);
                      const isDownloading = downloadingFiles.has(file.id);

                      return (
                        <div
                          key={file.id}
                          className={`flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-lg transition-all ${isNew ? 'ring-2 ring-green-500' : ''
                            }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="bg-black rounded-lg p-2 flex-shrink-0">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm text-black font-roboto truncate" style={{ fontWeight: 600 }}>
                                  {getFileName(file.fileUrl)}
                                </p>
                                {isNew && (
                                  <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-manrope" style={{ fontWeight: 700 }}>
                                    NEW
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                                Completed {new Date(file.createdAt).toLocaleDateString()} at {new Date(file.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleDownload(file.fileUrl, file.id)}
                              disabled={isDownloading}
                              className={`bg-black text-white px-4 py-2 rounded-lg font-manrope hover:bg-[#595959] transition-colors flex items-center gap-2 ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                              style={{ fontWeight: 700 }}
                            >
                              {isDownloading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  Download
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Download All Button with Loading */}
                  {completedFiles.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <button
                        onClick={handleDownloadAll}
                        disabled={downloadingAll}
                        className={`w-full bg-white text-black px-6 py-3 rounded-lg font-manrope hover:bg-[#EEEEEE] transition-colors flex items-center justify-center gap-2 ${downloadingAll ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        style={{ fontWeight: 700 }}
                      >
                        {downloadingAll ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Downloading All Files...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            Download All Files ({completedFiles.length})
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-8 text-center">
                  <div className="bg-[#EEEEEE] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-[#595959]" />
                  </div>
                  <h3 className="text-lg text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
                    Work In Progress
                  </h3>
                  <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                    Your VA is working on this request. Completed files will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout >
  );
}