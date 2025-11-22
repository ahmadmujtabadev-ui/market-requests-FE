/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useMemo, JSX } from 'react';
import { DashboardLayout } from '@/components/layouts';
import {
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  ChevronDown,
  Calendar,
  X,
  Loader2,
  UploadCloud, // NEW
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import {
  fetchRequestsAsync,
  updateRequestStatusAsync,
  uploadCompletedFileAsync,
} from '@/services/request/asyncThunk';
import type { Request, RequestStatus } from '@/services/request/endpoint';
import { selectRequests } from '@/redux/slices/requestSlice';

// --- Status config & helpers ---

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
    icon: <Clock className="w-4 h-4" />,
  },
  progress: {
    label: 'In Progress',
    bgColor: 'bg-black',
    textColor: 'text-white',
    icon: <FileText className="w-4 h-4" />,
  },
  revision: {
    label: 'Revision Needed',
    bgColor: 'bg-[#595959]',
    textColor: 'text-white',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-black',
    textColor: 'text-white',
    icon: <CheckCircle className="w-4 h-4" />,
  },
};

const STATUS_ORDER: RequestStatus[] = ['new', 'progress', 'revision', 'completed'];

function StatusBadge({ status }: { status: RequestStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-manrope ${config.bgColor} ${config.textColor}`}
      style={{ fontWeight: 700 }}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// --- Small card in the grid ---

function RequestCard({
  request,
  onClick,
}: {
  request: Request;
  onClick: () => void;
}) {
  const filesCount = request?.files?.length || 0;
  const completedFilesCount =
    request?.files?.filter((f) => f.fileType === 'va_completed').length || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-[#EEEEEE] p-5 hover:shadow-lg hover:border-black transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-4">
          <h3
            className="text-lg text-black font-manrope mb-2 truncate group-hover:text-black"
            style={{ fontWeight: 700 }}
          >
            {request?.projectTitle}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            {request?.template && (
              <>
                <span
                  className="inline-block px-2 py-1 bg-[#EEEEEE] text-[#595959] rounded text-xs font-roboto"
                  style={{ fontWeight: 500 }}
                >
                  {request?.template.category}
                </span>
                <span
                  className="text-xs text-[#595959] font-roboto"
                  style={{ fontWeight: 400 }}
                >
                  •
                </span>
                <span
                  className="text-xs text-[#595959] font-roboto"
                  style={{ fontWeight: 400 }}
                >
                  {request?.template?.title}
                </span>
              </>
            )}
          </div>
        </div>
        <StatusBadge status={request?.status} />
      </div>

      {/* Notes Preview */}
      {request.notes && (
        <div className="mb-4 p-3 bg-[#EEEEEE] rounded-lg">
          <p
            className="text-sm text-[#595959] font-roboto line-clamp-2"
            style={{ fontWeight: 400 }}
          >
            {request.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#EEEEEE]">
        <div
          className="flex items-center gap-4 text-xs text-[#595959] font-roboto"
          style={{ fontWeight: 400 }}
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {timeAgo(request?.createdAt)}
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            {filesCount} files
          </div>
          {completedFilesCount > 0 && (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-black" />
              {completedFilesCount} completed
            </div>
          )}
        </div>
        <button
          className="text-sm text-black font-manrope opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ fontWeight: 700 }}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

// --- Detail modal for VA (update status + upload completed file) ---

interface RequestDetailModalProps {
  request: Request | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: RequestStatus) => Promise<void>;
  onUploadCompletedFile: (id: string, url: string) => Promise<void>;
}

function RequestDetailModal({
  request,
  onClose,
  onUpdateStatus,
  onUploadCompletedFile,
}: RequestDetailModalProps) {
  const [localStatus, setLocalStatus] = useState<RequestStatus | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NEW: local file + drag state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  React.useEffect(() => {
    if (request) {
      setLocalStatus(request.status);
      setSelectedFile(null);
      setError(null);
    }
  }, [request]);

  if (!request) return null;

  const agentFiles =
    request.files?.filter((f) => f.fileType === 'agent_upload') || [];
  const completedFiles =
    request.files?.filter((f) => f.fileType === 'va_completed') || [];

  const getFileName = (url: string) => {
    try {
      return url.split('/').pop() || 'file';
    } catch {
      return 'file';
    }
  };

  const handleStatusSave = async () => {
    if (!localStatus || localStatus === request.status) return;
    setStatusSaving(true);
    setError(null);
    try {
      await onUpdateStatus(request.id, localStatus);
    } catch (e: any) {
      setError(e?.message || 'Failed to update status');
    } finally {
      setStatusSaving(false);
    }
  };

  // -------- UPLOAD HELPERS --------

  // TODO: replace with real upload (S3, Cloudinary, etc.)
  async function uploadFileAndGetUrl(file: File): Promise<string> {
    // TEMP: local blob URL; works only for demo
    return URL.createObjectURL(file);
  }

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
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFileAndGetUrl(selectedFile);
      await onUploadCompletedFile(request.id, url);
      setSelectedFile(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#EEEEEE] p-6 flex items-start justify-between">
          <div className="flex-1 mr-4">
            <h2
              className="text-2xl text-black font-manrope mb-2"
              style={{ fontWeight: 800 }}
            >
              {request?.projectTitle}
            </h2>
            <div className="flex items-center gap-2">
              {request?.template && (
                <>
                  <span
                    className="text-sm text-[#595959] font-roboto"
                    style={{ fontWeight: 400 }}
                  >
                    {request?.template?.category}
                  </span>
                  <span className="text-[#595959]">•</span>
                </>
              )}
              <span
                className="text-sm text-[#595959] font-roboto"
                style={{ fontWeight: 400 }}
              >
                Request ID: {request?.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#EEEEEE] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#595959]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status + Flow */}
          <div>
            <label
              className="block text-sm text-black font-manrope mb-2"
              style={{ fontWeight: 700 }}
            >
              Status
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setLocalStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-manrope border ${
                      localStatus === s
                        ? 'bg-black text-white border-black'
                        : 'bg-[#EEEEEE] text-[#595959] border-transparent hover:border-black/30'
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
                    statusSaving || !localStatus || localStatus === request.status
                  }
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-manrope border-2 border-black ${
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
                <StatusBadge status={request.status} />
              </div>
            </div>
          </div>

          {/* Template */}
          {request.template && (
            <div>
              <label
                className="block text-sm text-black font-manrope mb-2"
                style={{ fontWeight: 700 }}
              >
                Template Used
              </label>
              <div className="p-4 bg-[#EEEEEE] rounded-lg">
                <p
                  className="text-sm text-black font-roboto"
                  style={{ fontWeight: 500 }}
                >
                  {request.template.title}
                </p>
                <p
                  className="text-xs text-[#595959] font-roboto mt-1"
                  style={{ fontWeight: 400 }}
                >
                  Category: {request.template.category}
                </p>
              </div>
            </div>
          )}

          {/* Deadline */}
          <div>
            <label
              className="block text-sm text-black font-manrope mb-2"
              style={{ fontWeight: 700 }}
            >
              Deadline
            </label>
            <div className="p-4 bg-[#EEEEEE] rounded-lg">
              <p
                className="text-sm text-black font-roboto"
                style={{ fontWeight: 500 }}
              >
                {new Date(request.deadline).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Platforms */}
          {request.platforms && request.platforms.length > 0 && (
            <div>
              <label
                className="block text-sm text-black font-manrope mb-2"
                style={{ fontWeight: 700 }}
              >
                Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {request.platforms.map((platform, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-[#EEEEEE] text-[#595959] rounded-full text-xs font-roboto"
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
            <div>
              <label
                className="block text-sm text-black font-manrope mb-2"
                style={{ fontWeight: 700 }}
              >
                Dimensions
              </label>
              <div className="p-4 bg-[#EEEEEE] rounded-lg">
                <p
                  className="text-sm text-black font-roboto"
                  style={{ fontWeight: 500 }}
                >
                  {request.dimensions}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {request.notes && (
            <div>
              <label
                className="block text-sm text-black font-manrope mb-2"
                style={{ fontWeight: 700 }}
              >
                Instructions / Notes
              </label>
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
            <div>
              <label
                className="block text-sm text-black font-manrope mb-2"
                style={{ fontWeight: 700 }}
              >
                Agent Files ({agentFiles.length})
              </label>
              <div className="space-y-2">
                {agentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-[#EEEEEE] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#595959]" />
                      <span
                        className="text-sm text-black font-roboto"
                        style={{ fontWeight: 400 }}
                      >
                        {getFileName(file.fileUrl)}
                      </span>
                    </div>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-[#595959]" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Files */}
          {completedFiles.length > 0 && (
            <div>
              <label
                className="block text-sm text-black font-manrope mb-2"
                style={{ fontWeight: 700 }}
              >
                Completed Files ({completedFiles.length})
              </label>
              <div className="space-y-2">
                {completedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-black text-white rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      <span
                        className="text-sm font-roboto"
                        style={{ fontWeight: 400 }}
                      >
                        {getFileName(file.fileUrl)}
                      </span>
                    </div>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-[#595959] rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Completed File – Drag & Drop */}
          <div>
            <label
              className="block text-sm text-black font-manrope mb-2"
              style={{ fontWeight: 700 }}
            >
              Upload Completed File
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
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
              />

              <label htmlFor="completed-file-input" className="block cursor-pointer">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-[#EEEEEE] flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-[#595959]" />
                </div>

                <p
                  className="text-sm text-black font-manrope"
                  style={{ fontWeight: 700 }}
                >
                  Drag and drop your completed file
                </p>
                <p
                  className="text-xs text-[#595959] font-roboto mt-1"
                  style={{ fontWeight: 400 }}
                >
                  or click to browse and select files
                </p>

                <p
                  className="mt-3 text-xs text-[#595959] font-roboto"
                  style={{ fontWeight: 400 }}
                >
                  Supported formats: PDF, DOCX, PNG, JPG, MP4
                  <br />
                  Maximum file size: 30MB
                </p>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-roboto text-[#595959]">
                  <FileText className="w-4 h-4" />
                  <span className="truncate max-w-[220px] sm:max-w-[260px]">
                    {selectedFile.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleUploadFile}
                  disabled={uploading}
                  className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-manrope border-2 border-black ${
                    uploading
                      ? 'bg-[#EEEEEE] text-[#595959] cursor-not-allowed'
                      : 'bg-black text-white hover:bg-[#595959]'
                  } transition-colors`}
                  style={{ fontWeight: 700 }}
                >
                  {uploading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Upload Completed File
                </button>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs text-[#595959] font-roboto mb-1"
                style={{ fontWeight: 400 }}
              >
                Created
              </label>
              <p
                className="text-sm text-black font-roboto"
                style={{ fontWeight: 500 }}
              >
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label
                className="block text-xs text-[#595959] font-roboto mb-1"
                style={{ fontWeight: 400 }}
              >
                Last Updated
              </label>
              <p
                className="text-sm text-black font-roboto"
                style={{ fontWeight: 500 }}
              >
                {new Date(request.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-roboto">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#EEEEEE] p-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white border-2 border-black text-black px-4 py-3 rounded-lg font-manrope hover:bg-[#EEEEEE] transition-colors"
            style={{ fontWeight: 700 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main VA Work Queue Page ---

export default function VaWorkQueuePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: requests, isLoading } = useSelector(selectRequests);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    dispatch(fetchRequestsAsync());
  }, [dispatch]);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    const filtered = requests.filter((request) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        request?.projectTitle?.toLowerCase().includes(q) ||
        request?.template?.title?.toLowerCase().includes(q) ||
        request?.template?.category?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort by status (New → In Progress → Revision → Completed) then by createdAt
    return filtered.sort((a, b) => {
      const statusDiff =
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (statusDiff !== 0) return statusDiff;
      return (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, [requests, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: requests?.length || 0,
      new: requests?.filter((r) => r.status === 'new').length || 0,
      progress: requests?.filter((r) => r.status === 'progress').length || 0,
      revision: requests?.filter((r) => r.status === 'revision').length || 0,
      completed: requests?.filter((r) => r.status === 'completed').length || 0,
    };
  }, [requests]);

  const handleUpdateStatus = async (id: string, status: RequestStatus) => {
    await dispatch(updateRequestStatusAsync({ id, status }));
  };

  const handleUploadCompletedFile = async (id: string, url: string) => {
    await dispatch(
      uploadCompletedFileAsync({ id, fileUrl: url, fileType: 'va_completed' }),
    );
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
          {/* Filters bar */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or template..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                />
              </div>

              <div className="lg:w-64 relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959] pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as RequestStatus | 'all')
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                >
                  <option value="all">All Status ({statusCounts.all})</option>
                  <option value="new">New ({statusCounts.new})</option>
                  <option value="progress">
                    In Progress ({statusCounts.progress})
                  </option>
                  <option value="revision">
                    Revision Needed ({statusCounts.revision})
                  </option>
                  <option value="completed">
                    Completed ({statusCounts.completed})
                  </option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Summary text */}
          <div className="mb-4">
            <p
              className="text-sm text-[#595959] font-roboto"
              style={{ fontWeight: 400 }}
            >
              VA Work Queue • Showing {filteredRequests.length} request
              {filteredRequests.length !== 1 ? 's' : ''} sorted by status
            </p>
          </div>

          {/* Grid or Empty/Loading states */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-[#EEEEEE] p-5 animate-pulse"
                >
                  <div className="h-6 bg-[#EEEEEE] rounded mb-4"></div>
                  <div className="h-4 bg-[#EEEEEE] rounded mb-2"></div>
                  <div className="h-4 bg-[#EEEEEE] rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-12 text-center">
              <FileText className="w-12 h-12 text-[#595959] mx-auto mb-4" />
              <h3
                className="text-lg text-black font-manrope mb-2"
                style={{ fontWeight: 700 }}
              >
                No requests in your queue
              </h3>
              <p
                className="text-sm text-[#595959] font-roboto"
                style={{ fontWeight: 400 }}
              >
                Try changing the status filter or ask the agent to submit new
                work.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={() => setSelectedRequest(request)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onUpdateStatus={handleUpdateStatus}
        onUploadCompletedFile={handleUploadCompletedFile}
      />
    </DashboardLayout>
  );
}
