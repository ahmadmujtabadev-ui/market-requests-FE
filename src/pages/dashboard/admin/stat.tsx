/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { JSX, useEffect } from 'react';
import {
  Users,
  FileText,
  FolderOpen,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  BarChart3,
  User,
  UserCheck,
  UserX,
  Briefcase,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { fetchOverviewAsync } from '@/services/adminstats/ayncthunk';
import { LoadingOverlay } from '@/components/loaders/overlayloader';

export default function StatsOverviewPage() {
  const dispatch = useAppDispatch();
  const { overview, overviewLoading } = useAppSelector(
    (state) => state.stats
  );

  useEffect(() => {
    dispatch(fetchOverviewAsync());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      progress: 'bg-yellow-100 text-yellow-700',
      revision: 'bg-orange-100 text-orange-700',
      completed: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string): JSX.Element | null => {
    const icons: Record<string, JSX.Element> = {
      new: <AlertCircle className="w-3 h-3" />,
      progress: <Clock className="w-3 h-3" />,
      revision: <RefreshCw className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
    };
    return icons[status] || null;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!overview) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#EEEEEE] p-6 flex items-center justify-center">
          <p className="text-[#595959] text-sm">No overview data available.</p>
        </div>
      </DashboardLayout>
    );
  }
  if (overviewLoading) {
    return (
      <DashboardLayout>
        <LoadingOverlay isVisible />
      </DashboardLayout>
    );
  }
  const monthly = overview.charts?.monthlyRequests?.[0] ?? {
    total: 0,
    new: 0,
    progress: 0,
    revision: 0,
    completed: 0,
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#EEEEEE] p-6">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&display=swap');

          .font-manrope {
            font-family: 'Manrope', sans-serif;
          }

          .font-roboto {
            font-family: 'Roboto', sans-serif;
          }
        `}</style>

        <div className="mw-full mx-auto">
          <div className="mb-8">
            <h1
              className="text-3xl text-black font-manrope mb-2"
              style={{ fontWeight: 800 }}
            >
              Admin Dashboard
            </h1>
            <p
              className="text-base text-[#595959] font-roboto"
              style={{ fontWeight: 400 }}
            >
              Overview of system statistics and recent activity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-manrope text-[#595959] uppercase tracking-wider mb-2"
                    style={{ fontWeight: 800 }}
                  >
                    Total Users
                  </p>
                  <p
                    className="text-4xl font-manrope text-black mb-1"
                    style={{ fontWeight: 800 }}
                  >
                    {overview.users?.total ?? 0}
                  </p>
                  <div
                    className="flex gap-4 mt-3 text-xs font-roboto"
                    style={{ fontWeight: 400 }}
                  >
                    <span className="text-black flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />{' '}
                      {overview.users?.active ?? 0} Active
                    </span>
                    <span className="text-[#595959] flex items-center gap-1">
                      <UserX className="w-3 h-3" />{' '}
                      {overview.users?.inactive ?? 0} Inactive
                    </span>
                  </div>
                </div>
                <div className="bg-[#EEEEEE] p-3 rounded-lg">
                  <Users className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-manrope text-[#595959] uppercase tracking-wider mb-2"
                    style={{ fontWeight: 800 }}
                  >
                    Total Templates
                  </p>
                  <p
                    className="text-4xl font-manrope text-black mb-1"
                    style={{ fontWeight: 800 }}
                  >
                    {overview.templates?.total ?? 0}
                  </p>
                  <div
                    className="flex gap-4 mt-3 text-xs font-roboto"
                    style={{ fontWeight: 400 }}
                  >
                    <span className="text-[#595959]">
                      {overview.templates?.residential ?? 0} Residential
                    </span>
                    <span className="text-[#595959]">
                      {overview.templates?.commercial ?? 0} Commercial
                    </span>
                  </div>
                </div>
                <div className="bg-[#EEEEEE] p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-manrope text-[#595959] uppercase tracking-wider mb-2"
                    style={{ fontWeight: 800 }}
                  >
                    Total Requests
                  </p>
                  <p
                    className="text-4xl font-manrope text-black mb-1"
                    style={{ fontWeight: 800 }}
                  >
                    {overview.requests?.total ?? 0}
                  </p>
                  <div
                    className="flex gap-2 mt-3 text-xs font-roboto"
                    style={{ fontWeight: 400 }}
                  >
                    <span className="text-[#595959]">
                      {overview.requests?.new ?? 0} New
                    </span>
                    <span className="text-[#595959]">
                      {overview.requests?.progress ?? 0} In Progress
                    </span>
                  </div>
                </div>
                <div className="bg-[#EEEEEE] p-3 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-[#595959]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-manrope text-[#595959] uppercase tracking-wider mb-2"
                    style={{ fontWeight: 800 }}
                  >
                    Completed
                  </p>
                  <p
                    className="text-4xl font-manrope text-black mb-1"
                    style={{ fontWeight: 800 }}
                  >
                    {overview.requests?.completed ?? 0}
                  </p>
                  <div
                    className="flex gap-2 mt-3 text-xs font-roboto"
                    style={{ fontWeight: 400 }}
                  >
                    <span className="text-[#595959]">
                      {overview.requests?.revision ?? 0} Revision
                    </span>
                  </div>
                </div>
                <div className="bg-[#EEEEEE] p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg text-black font-manrope"
                  style={{ fontWeight: 700 }}
                >
                  Admins
                </h3>
                <div className="bg-[#EEEEEE] p-2 rounded-lg">
                  <Briefcase className="w-5 h-5 text-black" />
                </div>
              </div>
              <p
                className="text-4xl font-manrope text-black mb-1"
                style={{ fontWeight: 800 }}
              >
                {overview.users?.byRole?.admin ?? 0}
              </p>
              <p
                className="text-sm font-roboto text-[#595959]"
                style={{ fontWeight: 400 }}
              >
                Admin users
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg text-black font-manrope"
                  style={{ fontWeight: 700 }}
                >
                  Agents
                </h3>
                <div className="bg-[#EEEEEE] p-2 rounded-lg">
                  <User className="w-5 h-5 text-[#595959]" />
                </div>
              </div>
              <p
                className="text-4xl font-manrope text-black mb-1"
                style={{ fontWeight: 800 }}
              >
                {overview.users?.byRole?.agent ?? 0}
              </p>
              <p
                className="text-sm font-roboto text-[#595959]"
                style={{ fontWeight: 400 }}
              >
                Active agents
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg text-black font-manrope"
                  style={{ fontWeight: 700 }}
                >
                  Virtual Assistants
                </h3>
                <div className="bg-[#EEEEEE] p-2 rounded-lg">
                  <UserCheck className="w-5 h-5 text-black" />
                </div>
              </div>
              <p
                className="text-4xl font-manrope text-black mb-1"
                style={{ fontWeight: 800 }}
              >
                {overview.users?.byRole?.va ?? 0}
              </p>
              <p
                className="text-sm font-roboto text-[#595959]"
                style={{ fontWeight: 400 }}
              >
                VA users
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#EEEEEE] mb-8">
            <div className="p-6 border-b border-[#EEEEEE]">
              <div className="flex items-center justify-between">
                <h2
                  className="text-xl text-black font-manrope flex items-center gap-2"
                  style={{ fontWeight: 700 }}
                >
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </h2>
                <span
                  className="text-sm font-roboto text-[#595959]"
                  style={{ fontWeight: 400 }}
                >
                  {overview.recentActivity?.length ?? 0} recent items
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#EEEEEE]">
              {overview.recentActivity?.map((activity: any) => (
                <div
                  key={activity.id}
                  className="p-6 hover:bg-[#EEEEEE] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className="font-manrope text-black"
                          style={{ fontWeight: 700 }}
                        >
                          {activity.projectTitle}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-manrope ${getStatusColor(
                            activity.status
                          )}`}
                          style={{ fontWeight: 700 }}
                        >
                          {getStatusIcon(activity.status)}
                          {activity.status
                            ? activity.status.charAt(0).toUpperCase() +
                            activity.status.slice(1)
                            : ''}
                        </span>
                      </div>

                      <div
                        className="flex flex-wrap gap-4 text-sm font-roboto text-[#595959]"
                        style={{ fontWeight: 400 }}
                      >
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{activity.agent?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          <span>{activity.template?.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FolderOpen className="w-4 h-4" />
                          <span>{activity.template?.category}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1.5 text-sm font-roboto text-[#595959] ml-4"
                      style={{ fontWeight: 400 }}
                    >
                      <Calendar className="w-4 h-4" />
                      {formatDate(activity.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">
                Monthly Overview
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {monthly.total}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Requests</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {monthly.new}
                </p>
                <p className="text-sm text-gray-600 mt-1">New</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-700">
                  {monthly.progress}
                </p>
                <p className="text-sm text-gray-600 mt-1">In Progress</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-700">
                  {monthly.revision}
                </p>
                <p className="text-sm text-gray-600 mt-1">Revision</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {monthly.completed}
                </p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
