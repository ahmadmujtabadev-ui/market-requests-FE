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
  ChevronDown,
  Calendar,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { fetchRequestsAsync } from '@/services/request/asyncThunk';
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
          className="text-sm text-black font-manrope opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
          style={{ fontWeight: 700 }}
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
}

// --- Main VA Work Queue Page ---

export default function VaWorkQueuePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items: requests, isLoading } = useSelector(selectRequests);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

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
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl text-black font-manrope mb-2" style={{ fontWeight: 800 }}>
              VA Work Queue
            </h1>
            <p className="text-base text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
              Manage marketing requests and upload completed work
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 hover:shadow-lg transition-shadow">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Total
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {statusCounts.all}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 hover:shadow-lg transition-shadow">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                New
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {statusCounts.new}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 hover:shadow-lg transition-shadow">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                In Progress
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {statusCounts.progress}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 hover:shadow-lg transition-shadow">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Revision
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {statusCounts.revision}
              </p>
            </div>
            <div className="bg-black rounded-lg p-4 hover:shadow-lg transition-shadow">
              <p className="text-xs text-white/70 font-roboto mb-1" style={{ fontWeight: 400 }}>
                Completed
              </p>
              <p className="text-2xl text-white font-manrope" style={{ fontWeight: 800 }}>
                {statusCounts.completed}
              </p>
            </div>
          </div>

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
              Showing {filteredRequests.length} request
              {filteredRequests.length !== 1 ? 's' : ''} • Sorted by status and date
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
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'New requests will appear here when agents submit them'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={() => router.push(`/dashboard/vs/requests/${request.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}