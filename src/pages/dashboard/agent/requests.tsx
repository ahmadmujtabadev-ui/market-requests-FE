import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download,
  MessageSquare,
  ChevronDown,
  Calendar,
  X
} from 'lucide-react';
import { useRouter } from 'next/router';

type RequestStatus = 'new' | 'in_progress' | 'revision' | 'completed';

type Request = {
  id: string;
  projectTitle: string;
  templateId: string;
  templateTitle: string;
  templateCategory: string;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  filesCount: number;
  completedFilesCount?: number;
};

// Dummy data - replace with actual API call
const DUMMY_REQUESTS: Request[] = [
  {
    id: '1',
    projectTitle: '123 Main Street Property Brochure',
    templateId: 't1',
    templateTitle: 'Property Brochure',
    templateCategory: 'Property Brochures',
    status: 'in_progress',
    notes: 'Please use high-quality images and include virtual tour link',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    filesCount: 8,
  },
  {
    id: '2',
    projectTitle: 'Just Listed - Ocean View Condo',
    templateId: 't2',
    templateTitle: 'Just Listed',
    templateCategory: 'Just Listed',
    status: 'new',
    notes: 'Urgent: Need by tomorrow',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    filesCount: 12,
  },
  {
    id: '3',
    projectTitle: 'Open House Weekend Flyer',
    templateId: 't3',
    templateTitle: 'Open House',
    templateCategory: 'Open House',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    filesCount: 5,
    completedFilesCount: 3,
  },
  {
    id: '4',
    projectTitle: 'Q1 Market Update Newsletter',
    templateId: 't4',
    templateTitle: 'Market Updates',
    templateCategory: 'Market Updates',
    status: 'revision',
    notes: 'Please adjust color scheme to match brand',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    filesCount: 3,
  },
  {
    id: '5',
    projectTitle: 'Client Testimonial Graphics',
    templateId: 't5',
    templateTitle: 'Testimonials',
    templateCategory: 'Testimonials',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    filesCount: 4,
    completedFilesCount: 4,
  },
];

const STATUS_CONFIG = {
  new: {
    label: 'New',
    bgColor: 'bg-[#EEEEEE]',
    textColor: 'text-black',
    icon: <Clock className="w-4 h-4" />,
  },
  in_progress: {
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

function RequestCard({ request, onClick }: { request: Request; onClick: () => void }) {
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
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-[#EEEEEE] p-5 hover:shadow-lg hover:border-black transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="text-lg text-black font-manrope mb-2 truncate group-hover:text-black" style={{ fontWeight: 700 }}>
            {request.projectTitle}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block px-2 py-1 bg-[#EEEEEE] text-[#595959] rounded text-xs font-roboto" style={{ fontWeight: 500 }}>
              {request.templateCategory}
            </span>
            <span className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
              •
            </span>
            <span className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
              {request.templateTitle}
            </span>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Notes Preview */}
      {request.notes && (
        <div className="mb-4 p-3 bg-[#EEEEEE] rounded-lg">
          <p className="text-sm text-[#595959] font-roboto line-clamp-2" style={{ fontWeight: 400 }}>
            {request.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#EEEEEE]">
        <div className="flex items-center gap-4 text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {timeAgo(request.createdAt)}
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            {request.filesCount} files
          </div>
        </div>
        <button className="text-sm text-black font-manrope opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontWeight: 700 }}>
          View Details →
        </button>
      </div>
    </div>
  );
}

function RequestDetailModal({ request, onClose }: { request: Request | null; onClose: () => void }) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#EEEEEE] p-6 flex items-start justify-between">
          <div className="flex-1 mr-4">
            <h2 className="text-2xl text-black font-manrope mb-2" style={{ fontWeight: 800 }}>
              {request.projectTitle}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                {request.templateCategory}
              </span>
              <span className="text-[#595959]">•</span>
              <span className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                Request ID: {request.id}
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
          {/* Status */}
          <div>
            <label className="block text-sm text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
              Status
            </label>
            <StatusBadge status={request.status} />
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
              Template Used
            </label>
            <div className="p-4 bg-[#EEEEEE] rounded-lg">
              <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                {request.templateTitle}
              </p>
              <p className="text-xs text-[#595959] font-roboto mt-1" style={{ fontWeight: 400 }}>
                Category: {request.templateCategory}
              </p>
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div>
              <label className="block text-sm text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
                Instructions / Notes
              </label>
              <div className="p-4 bg-[#EEEEEE] rounded-lg">
                <p className="text-sm text-[#595959] font-roboto whitespace-pre-wrap" style={{ fontWeight: 400 }}>
                  {request.notes}
                </p>
              </div>
            </div>
          )}

          {/* Files */}
          <div>
            <label className="block text-sm text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
              Uploaded Files ({request.filesCount})
            </label>
            <div className="space-y-2">
              {[...Array(request.filesCount)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#EEEEEE] rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#595959]" />
                    <span className="text-sm text-black font-roboto" style={{ fontWeight: 400 }}>
                      file_{i + 1}.jpg
                    </span>
                  </div>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-[#595959]" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Files */}
          {request.status === 'completed' && request.completedFilesCount && (
            <div>
              <label className="block text-sm text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
                Completed Files ({request.completedFilesCount})
              </label>
              <div className="space-y-2">
                {[...Array(request.completedFilesCount)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-black text-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-roboto" style={{ fontWeight: 400 }}>
                        completed_{i + 1}.pdf
                      </span>
                    </div>
                    <button className="p-2 hover:bg-[#595959] rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Created
              </label>
              <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Last Updated
              </label>
              <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                {new Date(request.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-[#EEEEEE] p-6 flex gap-3">
          {request.status === 'revision' && (
            <button className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-manrope hover:bg-[#595959] transition-colors" style={{ fontWeight: 700 }}>
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Add Comments
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg font-manrope hover:bg-[#EEEEEE] transition-colors"
            style={{ fontWeight: 700 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setRequests(DUMMY_REQUESTS);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch = request.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           request.templateTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: requests.length,
      new: requests.filter(r => r.status === 'new').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      revision: requests.filter(r => r.status === 'revision').length,
      completed: requests.filter(r => r.status === 'completed').length,
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl text-black font-manrope mb-2" style={{ fontWeight: 800 }}>
                My Requests
              </h1>
              <p className="text-base text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                Track and manage all your marketing requests
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/agent/submit')}
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-manrope hover:bg-[#595959] transition-colors"
              style={{ fontWeight: 700 }}
            >
              <Plus className="w-5 h-5" />
              New Request
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requests..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                />
              </div>

              {/* Status Filter */}
              <div className="lg:w-64 relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959] pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                >
                  <option value="all">All Status ({statusCounts.all})</option>
                  <option value="new">New ({statusCounts.new})</option>
                  <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
                  <option value="revision">Revision ({statusCounts.revision})</option>
                  <option value="completed">Completed ({statusCounts.completed})</option>
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

          {/* Requests Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-[#EEEEEE] p-5 animate-pulse">
                  <div className="h-6 bg-[#EEEEEE] rounded mb-4"></div>
                  <div className="h-4 bg-[#EEEEEE] rounded mb-2"></div>
                  <div className="h-4 bg-[#EEEEEE] rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-12 text-center">
              <FileText className="w-12 h-12 text-[#595959] mx-auto mb-4" />
              <h3 className="text-lg text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
                No requests found
              </h3>
              <p className="text-sm text-[#595959] font-roboto mb-6" style={{ fontWeight: 400 }}>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Get started by creating your first request'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <button
                  onClick={() => router.push('/dashboard/agent/submit')}
                  className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-manrope hover:bg-[#595959] transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  <Plus className="w-5 h-5" />
                  Create Request
                </button>
              )}
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

      {/* Detail Modal */}
      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </DashboardLayout>
  );
}