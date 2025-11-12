import React, {
  JSX,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import {
  Plus,
  Search as SearchIcon,
  Filter,
  ChevronDown,
  Copy,
  Eye,
  RotateCw,
  Shield,
  Trash2,
  X,
  ChevronRight,
  AlertTriangle,
  MoreHorizontal,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layouts';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {
  deleteCredentialAsync,
  fetchCredentialsAsync,
  revokeCredentialAsync,
  rotateCredentialAsync,
} from '@/services/credientials/asyncThunk';
import { CredentialModel } from '@/redux/slices/credientialSlice';
import Toast from '@/components/Toast';

// ---------- Types ----------
type Exchange = 'binance' | 'bybit' | 'bingx';
type Status = 'active' | 'revoked';

interface CredentialUI {
  id: string;
  exchange: Exchange;
  label: string;
  apiKeyLast4: string;
  fingerprint: string;
  ownerEmail?: string;
  ownerUsername?: string;
  status: Status;
  createdAt: string;
  lastUsedAt?: string;
  notes?: string;
  connections?: { id: string; name: string; status: 'connected' | 'paused' }[];
  audit?: { at: string; event: string }[];
}

// Raw/loose API model shape (to avoid `any`)
type Nullable<T> = { [K in keyof T]?: T[K] | null | undefined };
type CredentialRaw = Nullable<
  CredentialModel & {
    apiKeyLast4?: string;
    apiKeyLast4Digits?: string;
    apiKeyFingerprint?: string;
    fingerprint?: string;
    ownerEmail?: string;
    ownerUsername?: string;
    lastUsedAt?: string;
    notes?: string;
    connections?: { id: string; name: string; status: 'connected' | 'paused' }[];
    audit?: { at: string; event: string }[];
  }
>;

// ---------- Utils ----------
const EXCHANGE_META: Record<Exchange, { name: string; logo: string }> = {
  binance: { name: 'Binance', logo: '/exchanges/binance.svg' },
  bybit: { name: 'Bybit', logo: '/exchanges/bybit.svg' },
  bingx: { name: 'BingX', logo: '/exchanges/bingx.svg' },
};

const cn = (...a: (string | false | null | undefined)[]) =>
  a.filter(Boolean).join(' ');

const daysBetween = (iso?: string) =>
  iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : Infinity;

const relativeTime = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso).getTime();
  const diff = d - Date.now();
  const mins = Math.round(diff / 60000);
  const hours = Math.round(diff / 3600000);
  const days = Math.round(diff / 86400000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  return rtf.format(days, 'day');
};

// Normalize backend → UI model (no `any`)
function normalizeCredential(c: CredentialRaw): CredentialUI {
  const last4 = c.apiKeyLast4 ?? c.apiKeyLast4Digits ?? '????';
  const fp = c.apiKeyFingerprint ?? c.fingerprint ?? '—';
  return {
    id: String(c.id),
    exchange: String(c.exchange) as Exchange,
    label: String(c.label ?? ''),
    apiKeyLast4: String(last4),
    fingerprint: String(fp),
    ownerEmail: c.ownerEmail ?? undefined,
    ownerUsername: c.ownerUsername ?? undefined,
    status: (c.status as Status) ?? 'active',
    createdAt: String(c.createdAt ?? new Date().toISOString()),
    lastUsedAt: c.lastUsedAt ?? undefined,
    notes: c.notes ?? undefined,
    connections: c.connections ?? undefined,
    audit: c.audit ?? undefined,
  };
}

// ---------- Tiny Reusable Components ----------
const Badge = React.memo(function Badge({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'slate' | 'emerald' | 'rose';
}) {
  const map = {
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
        map[tone],
      )}
    >
      {children}
    </span>
  );
});

function MultiSelect<T extends string>({
  label,
  options,
  values,
  setValues,
}: {
  label: string;
  options: { value: T; label: string }[];
  values: T[];
  setValues: (v: T[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (v: T) =>
    setValues(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  const selectedText = values.length ? `${values.length} selected` : 'All';
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
      >
        <Filter className="h-4 w-4" />
        {label}: <span className="font-medium">{selectedText}</span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="max-h-64 overflow-auto">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={values.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                />
                <span className="text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2 px-2 pb-1">
            <button
              className="text-xs text-slate-600 hover:underline"
              onClick={() => setValues([])}
              type="button"
            >
              Clear
            </button>
            <button
              className="text-xs font-medium text-indigo-600 hover:underline"
              onClick={() => setOpen(false)}
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BottomSheet({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[70%] rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-2xl">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        <div className="overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
    </div>
  );
}

function ReAuthModal({
  open,
  onClose,
  onConfirm,
  revealedKey,
  timeRemaining,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (pwd: string) => void;
  revealedKey?: string | null;
  timeRemaining?: number;
}) {
  const [pwd, setPwd] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-slate-700" />
          <h3 className="text-sm font-semibold text-slate-800">
            {revealedKey ? 'API Key Revealed' : 'Re-authentication required'}
          </h3>
        </div>

        {!revealedKey ? (
          <>
            <p className="text-sm text-slate-600">
              Enter your password to reveal the key once (visible for 30 seconds).
            </p>
            <input
              type="password"
              className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Your password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pwd.trim()) {
                  onConfirm(pwd);
                }
              }}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pwd.trim()) onConfirm(pwd);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Confirm
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Expires in {typeof timeRemaining === 'number' ? timeRemaining : 0}s
              </p>
              <Badge tone="emerald">Visible</Badge>
            </div>

            <div className="break-all rounded-lg bg-slate-50 p-3 font-mono text-sm">
              {revealedKey}
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Data Hook (fetch + map) ----------
function useCredentialData() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCredentialsAsync());
  }, [dispatch]);

  type Paged<T> = { items: T[]; page?: number; total?: number };
  type ItemsOrPaged<T> = T[] | Paged<T>;

  const { items: itemsOrPaged, isLoading } = useAppSelector((s) => s.credential as {
    items: ItemsOrPaged<CredentialModel>;
    isLoading: boolean;
  });

  const sourceItems: CredentialModel[] = useMemo(() => {
    const value = itemsOrPaged;
    return Array.isArray(value) ? value : (value?.items ?? []);
  }, [itemsOrPaged]);

  const rows = useMemo<CredentialUI[]>(
    () => sourceItems.map((c) => normalizeCredential(c as CredentialRaw)),
    [sourceItems],
  );

  return { rows, isLoading, refresh: () => dispatch(fetchCredentialsAsync()) };
}

// ---------- Main Page ----------
export default function Credentials(): JSX.Element {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { rows, isLoading, refresh } = useCredentialData();

  // Toolbar/UI state
  const [q, setQ] = useState('');
  const qDeferred = useDeferredValue(q);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [age, setAge] = useState<'any' | 'gt30' | 'gt90'>('any');
  const [sortBy, setSortBy] = useState<'created' | 'lastUsed'>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selection + UI
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, string | undefined>>({});
  console.log(copied)
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected],
  );

  // Reveal-once timer store
  const [reauthOpen, setReauthOpen] = useState(false);
  const revealTarget = useRef<string | null>(null);
  const [revealedUntil, setRevealedUntil] = useState<Record<string, number>>({});
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [statusOverride, setStatusOverride] = useState<Record<string, Status>>({});
  console.log(statusOverride)

  useEffect(() => {
    const id = setInterval(() => {
      setRevealedUntil((prev) => {
        const now = Date.now();
        const next = { ...prev };
        for (const k of Object.keys(next)) if (next[k] < now) delete next[k];
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const showCopied = useCallback((id: string, text: string) => {
    setCopied((prev) => ({ ...prev, [id]: text }));
    setTimeout(() => {
      setCopied((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 1500);
  }, []);

  const copyLast4 = useCallback(
    async (id: string, last4: string) => {
      try {
        await navigator.clipboard.writeText(last4);
        showCopied(id, `••••${last4}`);
        Toast.fire({ icon: 'success', title: `Copied last-4: ${last4}` });
      } catch {
        /* no-op */
      }
    },
    [showCopied],
  );

  const copyKey = useCallback(
    async (id: string, keyText: string) => {
      try {
        await navigator.clipboard.writeText(keyText);
        showCopied(id, keyText);
        Toast.fire({ icon: 'success', title: `Copied key: ${keyText}` });
      } catch {
        /* no-op */
      }
    },
    [showCopied],
  );

  const filtered = useMemo(() => {
    const query = qDeferred.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (exchanges.length && !exchanges.includes(r.exchange)) return false;
      if (statuses.length && !statuses.includes(r.status)) return false;
      if (age === 'gt30' && daysBetween(r.lastUsedAt) <= 30) return false;
      if (age === 'gt90' && daysBetween(r.lastUsedAt) <= 90) return false;
      if (!query) return true;
      const exName = EXCHANGE_META[r.exchange].name.toLowerCase();
      return (
        r.label.toLowerCase().includes(query) ||
        (r.ownerEmail ?? '').toLowerCase().includes(query) ||
        (r.ownerUsername ?? '').toLowerCase().includes(query) ||
        r.apiKeyLast4.toLowerCase().includes(query) ||
        exName.includes(query)
      );
    });

    const sorted = [...list].sort((a, b) => {
      const av = sortBy === 'created' ? a.createdAt : a.lastUsedAt || '';
      const bv = sortBy === 'created' ? b.createdAt : b.lastUsedAt || '';
      const cmp = new Date(av).getTime() - new Date(bv).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [rows, qDeferred, exchanges, statuses, age, sortBy, sortDir]);

  const unusedOver90 = useMemo(
    () => filtered.filter((r) => daysBetween(r.lastUsedAt) > 90 && r.status === 'active').length,
    [filtered],
  );

  // Actions
  const rotate = useCallback(
    async (id: string) => {
      try {
        await dispatch(rotateCredentialAsync(id)).unwrap();
        await refresh();
      } catch {
        /* thunks toast */
      }
    },
    [dispatch, refresh],
  );

  const revoke = useCallback(
    async (id: string | string[]) => {
      const ids = Array.isArray(id) ? id : [id];
      try {
        // optimistically set to revoked
        setStatusOverride((prev) => {
          const next = { ...prev };
          ids.forEach((i) => (next[i] = 'revoked'));
          return next;
        });

        await Promise.all(ids.map((i) => dispatch(revokeCredentialAsync(i)).unwrap()));
        // optional: await refresh(); // keep or remove
      } catch {
        // rollback on error
        setStatusOverride((prev) => {
          const next = { ...prev };
          ids.forEach((i) => delete next[i]);
          return next;
        });
      }
    },
    [dispatch /*, refresh*/],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteCredentialAsync(id)).unwrap();
        await refresh();
      } catch {
        /* thunks toast */
      }
    },
    [dispatch, refresh],
  );

  const addCredential = useCallback(
    () => router.push('/dashboard/pages/start'),
    [router],
  );

  // Reveal once
  const openRevealOnce = useCallback((id: string) => {
    revealTarget.current = id; // BUGFIX: must pass credential id (not last4)
    setReauthOpen(true);
  }, []);

  const confirmReveal = useCallback((/* password: string */) => {
    const id = revealTarget.current;
    if (!id) return;

    // In a real app you’d verify password on server & get full key once.
    // Here we mark the key as "revealed" for 30s and show a placeholder.
    setRevealedKey(`FULL-KEY-…-${id.slice(-4)}`);
    setRevealedUntil((prev) => ({ ...prev, [id]: Date.now() + 30_000 }));

    const timer = setInterval(() => {
      setRevealedUntil((prev) => {
        const remaining = (prev[id] ?? 0) - Date.now();
        if (remaining <= 0) {
          clearInterval(timer);
          setRevealedKey(null);
          setReauthOpen(false);
          return { ...prev, [id]: 0 };
        }
        return prev;
      });
    }, 1000);
  }, []);

  const [sheetFor, setSheetFor] = useState<CredentialUI | null>(null);

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Credential Vault
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Securely manage your API keys and secrets.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addCredential}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" /> New Credential
              </button>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Shield className="mt-0.5 h-5 w-5 text-slate-600" />
            <div className="text-sm text-slate-700">
              Secrets are encrypted. We only show key fingerprints after creation.
            </div>
          </div>
        </div>

        {/* Safety banner */}
        {unusedOver90 >= 3 && (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
              <div className="flex-1 text-sm text-amber-800">
                You have {unusedOver90} unused credentials (&gt; 90 days). Consider revoking them.
              </div>
              <button
                onClick={() =>
                  revoke(
                    filtered
                      .filter((r) => daysBetween(r.lastUsedAt) > 90 && r.status === 'active')
                      .map((r) => r.id),
                  )
                }
                className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
              >
                Revoke inactive
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Toolbar */}
            <div className="px-4 pb-3 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search by last-4, label, email, username…"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <MultiSelect
                      label="Exchange"
                      options={[
                        { label: 'Binance', value: 'binance' as const },
                        { label: 'Bybit', value: 'bybit' as const },
                        { label: 'BingX', value: 'bingx' as const },
                      ]}
                      values={exchanges}
                      setValues={setExchanges}
                    />
                    <MultiSelect
                      label="Status"
                      options={[
                        { label: 'Active', value: 'active' as const },
                        { label: 'Revoked', value: 'revoked' as const },
                      ]}
                      values={statuses}
                      setValues={setStatuses}
                    />
                    <div className="relative">
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() =>
                          setAge((prev) =>
                            prev === 'any' ? 'gt30' : prev === 'gt30' ? 'gt90' : 'any',
                          )
                        }
                        type="button"
                        title="Toggle age filter"
                      >
                        Age:{' '}
                        <span className="font-medium">
                          {age === 'any' ? 'Any' : age === 'gt30' ? '> 30d' : '> 90d'}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value === 'lastUsed' ? 'lastUsed' : 'created')
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="created">Sort: Created</option>
                  </select>
                  <select
                    value={sortDir}
                    onChange={(e) =>
                      setSortDir(e.target.value === 'asc' ? 'asc' : 'desc')
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk bar */}
            {selectedIds.length > 0 && (
              <div className="sticky top-0 z-10 border-y border-slate-200 bg-white/95 px-4 py-2 backdrop-blur sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">{selectedIds.length} selected</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectedIds.forEach((id) => void rotate(id))}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <RotateCw className="h-4 w-4" /> Rotate
                    </button>
                    <button
                      onClick={() => revoke(selectedIds)}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" /> Revoke
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop table */}
            <div className="px-4 pb-10 sm:px-6 lg:px-8">
              <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white lg:block">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300"
                          checked={filtered.length > 0 && filtered.every((r) => selected[r.id])}
                          onChange={(e) => {
                            const on = e.target.checked;
                            const next: Record<string, boolean> = {};
                            if (on) filtered.forEach((r) => (next[r.id] = true));
                            setSelected(next);
                          }}
                        />
                      </th>
                      <th className="px-3 py-3 text-left">Exchange</th>
                      <th className="px-3 py-3 text-left">Label</th>
                      <th className="px-3 py-3 text-left">Key</th>
                      <th className="px-3 py-3 text-left">Owner</th>
                      <th className="px-3 py-3 text-left">Status</th>
                      <th className="px-3 py-3 text-left">Created</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((r) => {
                      const revealActive =
                        revealedUntil[r.id] && revealedUntil[r.id] > Date.now();
                      return (
                        <React.Fragment key={r.id}>
                          <tr className="hover:bg-slate-50">
                            <td className="w-10 px-4 py-3 align-top">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300"
                                checked={!!selected[r.id]}
                                onChange={(e) =>
                                  setSelected((prev) => ({ ...prev, [r.id]: e.target.checked }))
                                }
                              />
                            </td>
                            <td className="px-3 py-3 align-top">
                              <div className="flex items-center gap-3">
                                <span className="text-slate-800">
                                  {EXCHANGE_META[r.exchange].name}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3 align-top">{r.label}</td>
                            <td className="px-3 py-3 align-top">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-800">
                                  {revealActive
                                    ? `FULL-KEY-…-${r.apiKeyLast4}`
                                    : `••••-••••-••••-${r.apiKeyLast4}`}
                                </span>
                                <button
                                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                  title="Copy last-4"
                                  onClick={() => copyLast4(r.id, r.apiKeyLast4)}
                                >
                                  <Copy className="h-5 w-5" />
                                </button>

                                {!revealActive ? (
                                  <button
                                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                                    title="Reveal once"
                                    onClick={() => openRevealOnce(r.id)} // BUGFIX: pass id
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <Badge tone="emerald">
                                    Visible {Math.ceil((revealedUntil[r.id] - Date.now()) / 1000)}s
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 align-top">
                              {r.ownerEmail || r.ownerUsername ? (
                                <div className="space-y-0.5">
                                  {r.ownerEmail && (
                                    <div className="text-slate-800">{r.ownerEmail}</div>
                                  )}
                                  {r.ownerUsername && (
                                    <div className="text-xs text-slate-500">
                                      @{r.ownerUsername}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-3 py-3 align-top">
                              {r.status === 'active' ? (
                                <Badge tone="emerald">Active</Badge>
                              ) : (
                                <Badge tone="rose">Revoked</Badge>
                              )}
                            </td>
                            <td className="px-3 py-3 align-top">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </td>
                            {/* <td className="px-3 py-3 align-top">
                              {relativeTime(r.lastUsedAt)}
                            </td> */}
                            <td className="px-3 py-3 align-top">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  className="rounded-lg px-2 py-1.5 text-slate-600 hover:bg-slate-100"
                                  title="Rotate"
                                  onClick={() => void rotate(r.id)}
                                >
                                  <RotateCw className="h-4 w-4" />
                                </button>
                                {r.status === 'active' ? (
                                  <button
                                    className="rounded-lg px-2 py-1.5 text-rose-600 hover:bg-rose-50"
                                    title="Revoke"
                                    onClick={() => void revoke(r.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <span className="px-2 py-1.5 text-xs text-slate-400">—</span>
                                )}
                                <button
                                  className="rounded-lg px-2 py-1.5 text-slate-600 hover:bg-slate-100"
                                  title="More"
                                  onClick={() =>
                                    setExpanded((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                                  }
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded row */}
                          {expanded[r.id] && (
                            <tr className="bg-slate-50/70">
                              <td colSpan={9} className="px-4 py-4 md:px-6">
                                <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 w-full max-w-2xl mx-auto">
                                  {/* Header */}
                                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Details
                                  </h3>

                                  {/* Info Rows */}
                                  <div className="space-y-3 text-sm">
                                    {/* <KeyRow
                                      label="Fingerprint"
                                      value={r.fingerprint}
                                      onCopy={() => void copyKey(r.id, r.fingerprint)}
                                    /> */}
                                    <KeyRow
                                      label="ID"
                                      value={r.id}
                                      onCopy={() => void copyKey(r.id, r.id)}
                                    />
                                    <SimpleRow
                                      label="Created"
                                      value={new Date(r.createdAt).toLocaleString()}
                                    />
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                    <button
                                      onClick={() => void rotate(r.id)}
                                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto"
                                    >
                                      <RotateCw className="h-4 w-4" /> Rotate
                                    </button>

                                    {r.status === 'active' ? (
                                      <button
                                        onClick={() => void revoke(r.id)}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100 transition-colors w-full sm:w-auto"
                                      >
                                        <Trash2 className="h-4 w-4" /> Revoke
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => void remove(r.id)}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto"
                                      >
                                        <Trash2 className="h-4 w-4" /> Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="space-y-3 lg:hidden">
                {filtered.map((r) => {
                  const revealActive =
                    revealedUntil[r.id] && revealedUntil[r.id] > Date.now();
                  return (
                    <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 overflow-hidden rounded">
                            <Image
                              src={EXCHANGE_META[r.exchange].logo}
                              width={32}
                              height={32}
                              alt=""
                            />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{r.label}</div>
                            <div className="text-xs text-slate-500">
                              {EXCHANGE_META[r.exchange].name}
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300"
                          checked={!!selected[r.id]}
                          onChange={(e) =>
                            setSelected((prev) => ({ ...prev, [r.id]: e.target.checked }))
                          }
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-lg border border-slate-100 p-2">
                          <div className="text-xs text-slate-500">Key</div>
                          <div className="mt-0.5 font-mono text-slate-800">
                            {revealActive
                              ? `FULL-KEY-…-${r.apiKeyLast4}`
                              : `••••-••••-••••-${r.apiKeyLast4}`}
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-100 p-2">
                          <div className="text-xs text-slate-500">Owner</div>
                          <div className="mt-0.5 text-slate-800">
                            {r.ownerEmail || r.ownerUsername || '—'}
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-100 p-2">
                          <div className="text-xs text-slate-500">Created</div>
                          <div className="mt-0.5 text-slate-800">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-100 p-2">
                          <div className="mt-0.5 text-slate-800">{relativeTime(r.lastUsedAt)}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          {r.status === 'active' ? (
                            <Badge tone="emerald">Active</Badge>
                          ) : (
                            <Badge tone="rose">Revoked</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            title="Copy last-4"
                            onClick={() => void copyKey(r.id, r.apiKeyLast4)}
                          >
                            <Copy className="h-5 w-5" />
                          </button>
                          {!revealActive ? (
                            <button
                              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                              title="Reveal once"
                              onClick={() => openRevealOnce(r.id)} // BUGFIX: pass id
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          ) : (
                            <Badge tone="emerald">
                              Visible {Math.ceil((revealedUntil[r.id] - Date.now()) / 1000)}s
                            </Badge>
                          )}
                          <button
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            title="Actions"
                            onClick={() => setSheetFor(r)}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile actions sheet */}
      <BottomSheet
        open={!!sheetFor}
        onClose={() => setSheetFor(null)}
        title={sheetFor ? `Actions · ${sheetFor.label}` : 'Actions'}
      >
        {sheetFor && (
          <div className="space-y-2">
            <button
              onClick={() => {
                void rotate(sheetFor.id);
                setSheetFor(null);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-800"
            >
              <span className="inline-flex items-center gap-2">
                <RotateCw className="h-4 w-4" /> Rotate key
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
            {sheetFor.status === 'active' ? (
              <button
                onClick={() => {
                  void revoke(sheetFor.id);
                  setSheetFor(null);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-left text-sm text-rose-700"
              >
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Revoke
                </span>
                <ChevronRight className="h-4 w-4 text-rose-400" />
              </button>
            ) : (
              <button
                onClick={() => {
                  void remove(sheetFor.id);
                  setSheetFor(null);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-800"
              >
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Remove
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            )}
            <button
              onClick={() => {
                openRevealOnce(sheetFor.id);
                setSheetFor(null);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-800"
            >
              <span className="inline-flex items-center gap-2">
                <Eye className="h-4 w-4" /> Reveal once
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={() => {
                void copyLast4(sheetFor.id, sheetFor.apiKeyLast4);
                setSheetFor(null);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-800"
            >
              <span className="inline-flex items-center gap-2">
                <Copy className="h-4 w-4" /> Copy last-4
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Re-auth Modal */}
      <ReAuthModal
        open={reauthOpen}
        onClose={() => {
          revealTarget.current = null;
          setRevealedKey(null);
          setReauthOpen(false);
        }}
        onConfirm={confirmReveal}
        revealedKey={revealedKey}
        timeRemaining={
          revealTarget.current
            ? Math.ceil(((revealedUntil[revealTarget.current] ?? 0) - Date.now()) / 1000)
            : undefined
        }
      />
    </DashboardLayout>
  );
}

// ---------- Small presentational rows ----------
function KeyRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-slate-800">{value}</span>
        <button
          className="rounded-lg p-1 hover:bg-slate-100"
          onClick={onCopy}
          title={`Copy ${label}`}
        >
          <Copy className="h-4 w-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

function SimpleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}

