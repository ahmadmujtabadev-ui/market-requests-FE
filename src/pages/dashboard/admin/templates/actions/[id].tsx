    import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { 
  ArrowLeft,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  User,
  Layers,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { fetchRequestByIdAsync, updateRequestStatusAsync } from '@/services/request/asyncThunk';
import { selectSelectedRequest, selectRequestLoading } from '@/redux/slices/requestSlice';
import type { RequestStatus } from '@/services/request/endpoint';

const STATUS_CONFIG = {
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

export default function AdminRequestDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = router.query;
  
  const request = useSelector(selectSelectedRequest);
  const isLoading = useSelector(selectRequestLoading);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchRequestByIdAsync(id));
    }
  }, [dispatch, id]);

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (!request) return;
    
    setIsChangingStatus(true);
    try {
      await dispatch(updateRequestStatusAsync({ id: request.id, status: newStatus }));
      // Refresh the request data after status change
      dispatch(fetchRequestByIdAsync(request.id));
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getFileName = (url: string) => {
    try {
      return url.split('/').pop() || 'file';
    } catch {
      return 'file';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 overflow-auto bg-[#EEEEEE] p-6 lg:p-8">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#EEEEEE] border-t-black mb-4"></div>
                <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  Loading request details...
                </p>
              </div>
            </div>
          </div>
        </div>
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
                <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  Request not found
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const agentFiles = request.files?.filter(f => f.fileType === 'agent_upload') || [];
  const completedFiles = request.files?.filter(f => f.fileType === 'va_completed') || [];

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
        <div className="w-full max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard/admin/requests')}
            className="inline-flex items-center gap-2 text-[#595959] hover:text-black mb-6 font-roboto transition-colors"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to All Requests
          </button>

          {/* Header */}
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
            </div>

            {/* Status with Admin Override */}
            <div className="flex items-center gap-4 p-4 bg-[#EEEEEE] rounded-lg">
              <div className="flex-1">
                <label className="block text-sm text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
                  Current Status
                </label>
                <StatusBadge status={request.status} />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
                  Change Status (Admin Override)
                </label>
                <select
                  value={request.status}
                  onChange={(e) => handleStatusChange(e.target.value as RequestStatus)}
                  disabled={isChangingStatus}
                  className="w-full px-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto bg-white focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 500 }}
                >
                  <option value="new">New</option>
                  <option value="progress">In Progress</option>
                  <option value="revision">Needs Revision</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Agent & Template Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Agent Information */}
              {request.agent && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-[#595959]" />
                    <h2 className="text-lg text-black font-manrope" style={{ fontWeight: 700 }}>
                      Agent Information
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                        Name
                      </p>
                      <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                        {request.agent.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                        Email
                      </p>
                      <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                        {request.agent.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                        Agent ID
                      </p>
                      <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                        {request.agent.id.substring(0, 12)}...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Information */}
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
                      <span className={`inline-block px-2 py-1 rounded text-xs font-roboto ${
                        request.template.type === 'residential' ? 'bg-black text-white' : 'bg-[#595959] text-white'
                      }`} style={{ fontWeight: 600 }}>
                        {request.template.type}
                      </span>
                    </div>
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
            </div>

            {/* Right Column - Request Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Platforms */}
              {request.platforms && request.platforms.length > 0 && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h2 className="text-lg text-black font-manrope mb-4" style={{ fontWeight: 700 }}>
                    Platforms
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

              {/* Instructions / Notes */}
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

              {/* Agent Uploaded Files */}
              {agentFiles.length > 0 && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h2 className="text-lg text-black font-manrope mb-4" style={{ fontWeight: 700 }}>
                    Agent Uploaded Files ({agentFiles.length})
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
                            <p className="text-sm text-black font-roboto truncate" style={{ fontWeight: 500 }}>
                              {getFileName(file.fileUrl)}
                            </p>
                            <p className="text-xs text-[#595959] font-roboto mt-1" style={{ fontWeight: 400 }}>
                              Uploaded {new Date(file.createdAt).toLocaleDateString()}
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

              {/* VA Completed Files */}
              {completedFiles.length > 0 && (
                <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                  <h2 className="text-lg text-black font-manrope mb-4" style={{ fontWeight: 700 }}>
                    VA Completed Files ({completedFiles.length})
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
                            <p className="text-sm font-roboto truncate" style={{ fontWeight: 500 }}>
                              {getFileName(file.fileUrl)}
                            </p>
                            <p className="text-xs opacity-70 font-roboto mt-1" style={{ fontWeight: 400 }}>
                              Completed {new Date(file.createdAt).toLocaleDateString()}
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

              {/* Timestamps */}
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
                <h2 className="text-lg text-black font-manrope mb-4" style={{ fontWeight: 700 }}>
                  Timeline
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-[#595959] font-roboto mb-2" style={{ fontWeight: 400 }}>
                      Created At
                    </p>
                    <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#595959] font-roboto mb-2" style={{ fontWeight: 400 }}>
                      Last Updated
                    </p>
                    <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                      {new Date(request.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}