import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layouts';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { getDashboardStatsAsync } from '@/services/dashboard/asyncThunk';
import { Plus, Activity } from 'lucide-react';
import type { RootState } from '@/redux/store';

function StatCard({
  title,
  value,
  sub,
  right,
  icon,
}: {
  title: string;
  value: string | number;
  sub?: string | React.ReactNode;
  right?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </div>
          <div className="text-3xl font-semibold text-slate-900">{value}</div>
          {sub && <div className="text-xs text-slate-500">{sub}</div>}
        </div>
        <div className="shrink-0">{right}</div>
      </div>
      {icon && (
        <div className="pointer-events-none absolute -right-2 -top-2 opacity-10">
          {icon}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Pull fields from the new dashboard slice
  const {
    isLoading,
    connectionsActive = 0,
    connectionsTotal = 0,
    connectionsTrendPct = 0,
    credentialsValid = 0,
    credentialsTotal = 0,
  } = useAppSelector((s: RootState) => s.dashboard);

  useEffect(() => {
    dispatch(getDashboardStatsAsync());
  }, [dispatch]);

  const goAddIntegration = () => router.push('/dashboard/pages/start');
  ;

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">
                Here is what is happening with your exchanges and keys.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={goAddIntegration}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                Add Integration
              </button>

            </div>
          </div>
        </div>

        <div className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {/* Connections */}
            <StatCard
              title="Connections"
              value={connectionsActive}
              sub={`active of ${connectionsTotal}`}
              right={
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <Activity className="h-4 w-4" />
                  {connectionsTrendPct >= 0 ? '+' : ''}
                  {connectionsTrendPct}%
                </div>
              }
              icon={<Activity className="h-16 w-16" />}
            />

            {/* Credentials */}
            <StatCard
              title="Credentials"
              value={credentialsValid}
              sub={`valid / ${credentialsTotal}`}
              right={<div className="text-xs text-slate-500">Vault</div>}
            />

          </div>

          {/* Skeleton */}
          {isLoading && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}