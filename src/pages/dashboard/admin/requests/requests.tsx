/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useMemo, JSX } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { 
  Search, 
  Filter, 
  Eye,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Sparkles,
  // Bell,
  Package,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { fetchRequestsAsync } from '@/services/request/asyncThunk';
import { selectRequests } from '@/redux/slices/requestSlice';
import type {  RequestStatus } from '@/services/request/endpoint';

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
    icon: <Clock className="w-4 h-4" />,
  },
  progress: {
    label: 'In Progress',
    bgColor: 'bg-black',
    textColor: 'text-white',
    icon: <FileText className="w-4 h-4" />,
  },
  revision: {
    label: 'Needs Revision',
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

// // Helper to check if request has recent updates (within last 24 hours)
// function hasRecentUpdates(request: Request): boolean {
//   const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
//   const updatedTime = new Date(request.updatedAt).getTime();
//   return updatedTime > oneDayAgo && request.updatedAt !== request.createdAt;
// }

// Helper to count new completed files (created within last 24 hours)
// function getNewCompletedFilesCount(request: Request): number {
//   const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
//   const completedFiles = request.files?.filter(f => f.fileType === 'va_completed') || [];
//   return completedFiles.filter(f => new Date(f.createdAt).getTime() > oneDayAgo).length;
// }

export default function AgentRequestsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items: requests, isLoading, error } = useSelector(selectRequests);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  useEffect(() => {
    dispatch(fetchRequestsAsync());
  }, [dispatch]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch = 
        request.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.template?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.template?.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const requestCounts = useMemo(() => {
    return {
      all: requests.length,
      new: requests.filter(r => r.status === 'new').length,
      progress: requests.filter(r => r.status === 'progress').length,
      revision: requests.filter(r => r.status === 'revision').length,
      completed: requests.filter(r => r.status === 'completed').length,
    };
  }, [requests]);

 // Replace your existing helper functions with these updated versions:

// Helper to check if request has recent updates (within last 24 hours)
function hasRecentUpdates(request: any): boolean {
  const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
  const updatedTime = new Date(request.updatedAt).getTime();
  return updatedTime > oneDayAgo && request.updatedAt !== request.createdAt;
}

// Helper to count new completed files (created within last 24 hours)
function getNewCompletedFilesCount(request: any): number {
  const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
  const completedFiles = request.files?.filter((f: any) => f.fileType === 'va_completed') || [];
  return completedFiles.filter((f: any) => new Date(f.createdAt).getTime() > oneDayAgo).length;
}

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
          }
        }

        .pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>

      <div className="flex-1 overflow-auto bg-[#EEEEEE] p-6 lg:p-8">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl text-black font-manrope mb-2" style={{ fontWeight: 800 }}>
                  My Requests
                </h1>
                <p className="text-base text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  Track your marketing requests and receive completed work from VA team
                </p>
              </div>
              
              {/* Notification Badge */}
              {/* {requestsWithUpdates > 0 && (
                <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 pulse-glow">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm font-manrope" style={{ fontWeight: 700 }}>
                    {requestsWithUpdates} New Update{requestsWithUpdates !== 1 ? 's' : ''}
                  </span>
                </div>
              )} */}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 hover:shadow-lg transition-shadow">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Total Requests
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {requestCounts.all}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 hover:shadow-lg transition-shadow">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                New
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {requestCounts.new}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 hover:shadow-lg transition-shadow">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                In Progress
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {requestCounts.progress}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 hover:shadow-lg transition-shadow">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Revision
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {requestCounts.revision}
              </p>
            </div>
            <div className="bg-black rounded-lg p-4 hover:shadow-lg transition-shadow">
              <p className="text-xs text-white/70 font-roboto mb-1" style={{ fontWeight: 400 }}>
                Completed
              </p>
              <p className="text-2xl text-white font-manrope" style={{ fontWeight: 800 }}>
                {requestCounts.completed}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 font-roboto" style={{ fontWeight: 400 }}>
                {error}
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by project or template..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                />
              </div>
              <div className="lg:w-64 relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959] pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                >
                  <option value="all">All Status ({requestCounts.all})</option>
                  <option value="new">New ({requestCounts.new})</option>
                  <option value="progress">In Progress ({requestCounts.progress})</option>
                  <option value="revision">Revision ({requestCounts.revision})</option>
                  <option value="completed">Completed ({requestCounts.completed})</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
              Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#EEEEEE] border-t-black"></div>
                <p className="text-sm text-[#595959] font-roboto mt-4" style={{ fontWeight: 400 }}>
                  Loading requests...
                </p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-[#595959] mx-auto mb-4" />
                <h3 className="text-lg text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
                  No requests found
                </h3>
                <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Create your first request to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#EEEEEE]">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        REQUEST
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        TEMPLATE
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        STATUS
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        COMPLETED FILES
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        UPDATED
                      </th>
                      <th className="text-right px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => {
                      const hasUpdates = hasRecentUpdates(request);
                      const newFiles = getNewCompletedFilesCount(request);
                      const completedFiles = request.files?.filter(f => f.fileType === 'va_completed') || [];
                      
                      return (
                        <tr 
                          key={request.id} 
                          className={`border-t border-[#EEEEEE] hover:bg-[#EEEEEE]/50 transition-colors ${
                            hasUpdates || newFiles > 0 ? 'bg-green-50/30' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="text-sm text-black font-roboto mb-1" style={{ fontWeight: 500 }}>
                                  {request.projectTitle}
                                </p>
                                <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                                  ID: {request.id.substring(0, 8)}...
                                </p>
                              </div>
                              {(hasUpdates || newFiles > 0) && (
                                <div className="flex-shrink-0">
                                  <div className="bg-black text-white px-2 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span className="text-xs font-manrope" style={{ fontWeight: 700 }}>
                                      New
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-2 py-1 bg-[#EEEEEE] text-[#595959] rounded text-xs font-roboto" style={{ fontWeight: 500 }}>
                              {request.template?.title || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="px-6 py-4">
                            {completedFiles.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm font-manrope" style={{ fontWeight: 700 }}>
                                    {completedFiles.length}
                                  </span>
                                </div>
                                {newFiles > 0 && (
                                  <div className="bg-green-500 text-white px-2 py-1 rounded-full">
                                    <span className="text-xs font-manrope" style={{ fontWeight: 700 }}>
                                      +{newFiles}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                              {timeAgo(request.updatedAt)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => router.push(`/dashboard/admin/requests/${request.id}`)}
                                className="bg-black text-white px-4 py-2 rounded-lg font-manrope hover:bg-[#595959] transition-colors flex items-center gap-2"
                                style={{ fontWeight: 700 }}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}