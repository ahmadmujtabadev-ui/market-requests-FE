/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {  useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layouts';
import { ShieldCheck, Plug, Eye, EyeOff, ClipboardPaste, Info, ChevronRight } from 'lucide-react';
import { useAppDispatch } from '@/hooks/hooks';
import { saveLeasesAsync } from '@/services/credientials/asyncThunk';

type Exchange = 'binance' | 'bybit' | 'bingx';

const EXCHANGES: { id: Exchange; name: string; logo: string }[] = [
  { id: 'binance', name: 'Binance', logo: '/exchanges/binance.svg' },
  { id: 'bybit', name: 'Bybit', logo: '/exchanges/bybit.svg' },
  { id: 'bingx', name: 'BingX', logo: '/exchanges/bingx.svg' },
];

function SegmentedExchange({
  value,
  onChange,
}: {
  value: Exchange | null;
  onChange: (val: Exchange) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {EXCHANGES.map((x) => {
        const active = value === x.id;
        return (
          <button
            key={x.id}
            type="button"
            onClick={() => onChange(x.id)}
            className={[
              'group flex items-center gap-3 rounded-xl border p-3 text-left transition',
              active
                ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50'
                : 'border-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
          
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-900">{x.name}</div>
              <div className="text-xs text-slate-500">Spot / Futures supported</div>
            </div>
            <Plug className={active ? 'h-4 w-4 text-indigo-600' : 'h-4 w-4 text-slate-400'} />
          </button>
        );
      })}
    </div>
  );
}

function MaskedInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch {
      // no-op
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        {hint}
      </div>
      <div className="flex rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-indigo-200">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-l-xl border-0 px-3 py-2 text-sm text-slate-900 outline-none"
          autoComplete="off"
        />
        <div className="flex items-center gap-1 pr-1">
          <button
            type="button"
            onClick={paste}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            title="Paste from clipboard"
          >
            <ClipboardPaste className="h-4 w-4" />
            Paste
          </button>
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="inline-flex items-center rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-50"
            title={show ? 'Hide' : 'Show'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddIntegrationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // form state
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [label, setLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => !!exchange && apiKey.trim() !== '' && apiSecret.trim() !== '', [exchange, apiKey, apiSecret]);

  const onCancel = () => router.push('/connections');
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        exchange: exchange!,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
        email: email.trim() || undefined,
        username: username.trim() || undefined,
        label: label.trim() || undefined,
      };

     await dispatch(saveLeasesAsync(payload) as any).unwrap();
      
      // Success - redirect with success indicator
      router.push('/dashboard/pages/credientials');
    } catch (err: any) {
      // Handle error
      setError(err?.message || 'Failed to save integration. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Integration</h1>
          <p className="mt-1 text-sm text-slate-600">
            Connect an exchange by adding an API key and secret.
          </p>
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="px-4 pb-28 sm:px-6 lg:px-8">
          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm text-rose-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Left: form */}
            <div className="xl:col-span-2 space-y-6">
              {/* Exchange */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-4">
                  <label className="text-sm font-semibold text-slate-800">
                    Exchange <span className="text-rose-600">*</span>
                  </label>
                </div>
                <SegmentedExchange value={exchange} onChange={setExchange} />
              </div>

              {/* Credentials */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
                <MaskedInput
                  label="API Key"
                  value={apiKey}
                  onChange={setApiKey}
                  required
                  placeholder="Paste your API key"
                  hint={
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Info className="h-3.5 w-3.5" /> Default masked
                    </span>
                  }
                />

                <MaskedInput
                  label="API Secret"
                  value={apiSecret}
                  onChange={setApiSecret}
                  required
                  placeholder="Paste your API secret"
                  hint={
                    <a
                      href="https://www.binance.com/en/support/faq"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                      title="Learn how to generate a secret on your exchange"
                    >
                      Generate from exchange <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                  }
                />

                {/* Optional fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Email (optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Username (optional)</label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="exchange username"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Label (optional short name)
                  </label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Main Binance"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Right: sticky checklist */}
            <div className="xl:col-span-1">
              <div className="xl:sticky xl:top-24 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">Connection Checklist</h3>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                      Create <b>read/trade</b> key in your exchange
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                      Restrict IPs <span className="text-slate-500">(recommended)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                      Disable withdrawals
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-5 sm:p-6">
                  <div className="mb-2 flex items-center gap-2 text-emerald-800">
                    <ShieldCheck className="h-5 w-5" />
                    <h4 className="text-sm font-semibold">Security Tips</h4>
                  </div>
                  <ul className="list-disc pl-5 text-sm text-emerald-900">
                    <li>We encrypt your secrets at rest.</li>
                    <li>We never display your full secret again after saving.</li>
                    <li>Rotate keys periodically and revoke unused ones.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={[
                    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white',
                    isValid && !isSubmitting ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-400 cursor-not-allowed',
                  ].join(' ')}
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}