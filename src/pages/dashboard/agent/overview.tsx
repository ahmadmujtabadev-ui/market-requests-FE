import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layouts';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Package } from 'lucide-react';

type RequestStatus = 'new' | 'in_progress' | 'revision' | 'completed';

type StatCardData = {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon: React.ReactNode;
  iconBg: string;
};

// Dummy data - replace with actual Redux state
const DUMMY_STATS = {
  totalRequests: 24,
  pendingRequests: 8,
  inProgressRequests: 5,
  completedRequests: 11,
  thisWeekRequests: 6,
  weekTrend: 12,
};

function StatCard({ title, value, subtitle, trend, icon, iconBg }: StatCardData) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#EEEEEE] bg-white p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-manrope text-[#595959] uppercase tracking-wider mb-2" style={{ fontWeight: 800 }}>
            {title}
          </p>
          <p className="text-4xl font-manrope text-black mb-1" style={{ fontWeight: 800 }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm font-roboto text-[#595959]" style={{ fontWeight: 400 }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-3 flex items-center gap-1.5">
              <TrendingUp className={`w-4 h-4 ${trend.value >= 0 ? 'text-black' : 'text-[#595959]'}`} />
              <span className={`text-sm font-roboto ${trend.value >= 0 ? 'text-black' : 'text-[#595959]'}`} style={{ fontWeight: 500 }}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs font-roboto text-[#595959]" style={{ fontWeight: 400 }}>
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, icon, onClick }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 rounded-lg border-2 border-[#EEEEEE] bg-white hover:border-black hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-[#EEEEEE] group-hover:bg-black transition-colors">
          <div className="w-6 h-6 text-[#595959] group-hover:text-white transition-colors">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-manrope text-black mb-1" style={{ fontWeight: 700 }}>
            {title}
          </h3>
          <p className="text-sm font-roboto text-[#595959]" style={{ fontWeight: 400 }}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function RecentRequestRow({ 
  title, 
  status, 
  date, 
  template 
}: { 
  title: string; 
  status: RequestStatus; 
  date: string;
  template: string;
}) {
  const statusConfig = {
    new: { label: 'New', bg: 'bg-[#EEEEEE]', text: 'text-black', icon: <Clock className="w-3 h-3" /> },
    in_progress: { label: 'In Progress', bg: 'bg-black', text: 'text-white', icon: <FileText className="w-3 h-3" /> },
    revision: { label: 'Revision', bg: 'bg-[#595959]', text: 'text-white', icon: <AlertCircle className="w-3 h-3" /> },
    completed: { label: 'Completed', bg: 'bg-black', text: 'text-white', icon: <CheckCircle className="w-3 h-3" /> },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-4 hover:bg-[#EEEEEE] rounded-lg transition-colors">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-manrope text-black truncate mb-1" style={{ fontWeight: 700 }}>
          {title}
        </p>
        <p className="text-xs font-roboto text-[#595959]" style={{ fontWeight: 400 }}>
          {template}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-roboto text-[#595959] hidden sm:block" style={{ fontWeight: 400 }}>
          {date}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-manrope ${config.bg} ${config.text}`} style={{ fontWeight: 700 }}>
          {config.icon}
          {config.label}
        </span>
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const router = useRouter();

  // TODO: Replace with actual Redux dispatch and state
  useEffect(() => {
    // dispatch(fetchDashboardStatsAsync());
  }, []);

  const stats: StatCardData[] = [
    {
      title: 'Total Requests',
      value: DUMMY_STATS.totalRequests,
      subtitle: 'All time',
      icon: <FileText className="w-6 h-6 text-black" />,
      iconBg: 'bg-[#EEEEEE]',
    },
    {
      title: 'Pending',
      value: DUMMY_STATS.pendingRequests,
      subtitle: 'Awaiting review',
      icon: <Clock className="w-6 h-6 text-[#595959]" />,
      iconBg: 'bg-[#EEEEEE]',
    },
    {
      title: 'In Progress',
      value: DUMMY_STATS.inProgressRequests,
      subtitle: 'Being worked on',
      icon: <Package className="w-6 h-6 text-black" />,
      iconBg: 'bg-[#EEEEEE]',
    },
    {
      title: 'Completed',
      value: DUMMY_STATS.completedRequests,
      subtitle: 'This month',
      trend: {
        value: DUMMY_STATS.weekTrend,
        label: 'vs last month',
      },
      icon: <CheckCircle className="w-6 h-6 text-black" />,
      iconBg: 'bg-[#EEEEEE]',
    },
  ];

  // Dummy recent requests
  const recentRequests = [
    { id: '1', title: '123 Main Street Brochure', status: 'in_progress' as RequestStatus, date: '2 hours ago', template: 'Property Brochure' },
    { id: '2', title: 'Just Listed - Ocean View', status: 'new' as RequestStatus, date: '5 hours ago', template: 'Just Listed' },
    { id: '3', title: 'Open House Flyer', status: 'completed' as RequestStatus, date: '1 day ago', template: 'Open House' },
    { id: '4', title: 'Market Update Q1', status: 'revision' as RequestStatus, date: '2 days ago', template: 'Market Updates' },
    { id: '5', title: 'Testimonial Graphics', status: 'completed' as RequestStatus, date: '3 days ago', template: 'Testimonials' },
  ];

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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl text-black font-manrope mb-2" style={{ fontWeight: 800 }}>
              Welcome Back, Agent
            </h1>
            <p className="text-base text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
              Here's an overview of your marketing requests and activity
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl text-black font-manrope mb-4" style={{ fontWeight: 700 }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuickActionCard
                title="Submit New Request"
                description="Create a new marketing request"
                icon={<Plus className="w-6 h-6" />}
                onClick={() => router.push('/dashboard/agent/submit')}
              />
              <QuickActionCard
                title="Browse Templates"
                description="Explore our template library"
                icon={<FileText className="w-6 h-6" />}
                onClick={() => router.push('/dashboard/agent/templates')}
              />
              <QuickActionCard
                title="View All Requests"
                description="See your complete request history"
                icon={<Package className="w-6 h-6" />}
                onClick={() => router.push('/dashboard/agent/requests')}
              />
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-black font-manrope" style={{ fontWeight: 700 }}>
                Recent Requests
              </h2>
              <button
                onClick={() => router.push('/dashboard/agent/requests')}
                className="text-sm font-manrope text-black hover:text-[#595959] transition-colors"
                style={{ fontWeight: 700 }}
              >
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {recentRequests.map((request) => (
                <RecentRequestRow key={request.id} {...request} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}