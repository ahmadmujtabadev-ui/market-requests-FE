/* eslint-disable @typescript-eslint/no-explicit-any */

// TradesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layouts";
import { RefreshCcw } from "lucide-react";

type TradeRow = {
  id: string;
  openedAt: string;   // ISO
  closedAt?: string;  // ISO | undefined (e.g., still open)
  symbol: string;     // e.g. BTCUSDT, EURUSD
  exchange: "binance" | "bybit" | "bingx" | string;
  tp?: number;        // take profit price
  sl?: number;        // stop loss price
  lotSize: number;    // position size (lots/contracts)
  pnl: number;        // profit/loss in account currency
  userEmail: string;
};

const EXCHANGE_NAME: Record<string, string> = {
  binance: "Binance",
  bybit: "Bybit",
  bingx: "BingX",
};

// --- Utils ---
function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

function timeAgo(iso?: string) {
  if (!iso) return "—";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(-mins, "minute");
}

function fmtPnL(v: number) {
  const s = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Math.abs(v) < 1 ? 4 : 2,
  }).format(v);
  return s;
}

function fmtLots(v: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(v);
}

// --- Dummy “DB fetch” ---
const DUMMY_TRADES: TradeRow[] = [
  {
    id: "t_1001",
    openedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5h ago
    closedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15m ago
    symbol: "BTCUSDT",
    exchange: "binance",
    tp: 63950,
    sl: 61500,
    lotSize: 0.25,
    pnl: 182.45,
    userEmail: "ali.khan@example.com",
  },
  {
    id: "t_1002",
    openedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4h ago
    closedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),  // 1h ago
    symbol: "ETHUSDT",
    exchange: "bybit",
    tp: 2550,
    sl: 2440,
    lotSize: 1.0,
    pnl: -42.9,
    userEmail: "fatima.n@example.com",
  },
  {
    id: "t_1003",
    openedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
    // still open
    symbol: "EURUSD",
    exchange: "bingx",
    tp: 1.098,
    sl: 1.088,
    lotSize: 0.5,
    pnl: 12.34,
    userEmail: "murtaza@acme.co",
  },
  {
    id: "t_1004",
    openedAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10h ago
    closedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),   // 5m ago
    symbol: "XAUUSD",
    exchange: "binance",
    tp: 2385.5,
    sl: 2350.0,
    lotSize: 0.1,
    pnl: 76.12,
    userEmail: "zara@example.org",
  },
];

export default function TradesPage() {
  const [q, setQ] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rows, setRows] = useState<TradeRow[]>([]);

  // Simulate DB fetch
  useEffect(() => {
    setRows(DUMMY_TRADES);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const exName = EXCHANGE_NAME[r.exchange] ?? r.exchange;
      return (
        r.symbol.toLowerCase().includes(needle) ||
        exName.toLowerCase().includes(needle) ||
        r.userEmail.toLowerCase().includes(needle)
      );
    });
  }, [rows, q]);

  const handleRefresh = () => {
    // If/when you wire a real DB call, do it here.
    setIsRefreshing(true);
    setTimeout(() => {
      setRows([...DUMMY_TRADES]); // no-op refresh for now
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trades</h1>
            <p className="text-sm text-slate-600">
              View recent trades fetched directly from the database.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={isRefreshing}
            title="Refresh"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by symbol, exchange, or email…"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-3 text-left">Trade Time</th>
                <th className="px-3 py-3 text-left">Symbol</th>
                <th className="px-3 py-3 text-left">Exchange</th>
                <th className="px-3 py-3 text-left">TP/SL</th>
                <th className="px-3 py-3 text-left">Lot Size</th>
                <th className="px-3 py-3 text-left">PnL</th>
                <th className="px-3 py-3 text-left">Close Time</th>
                <th className="px-3 py-3 text-left">User email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => {
                const exName = EXCHANGE_NAME[r.exchange] ?? r.exchange;
                return (
                  <tr key={r.id}>
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span>{fmtDate(r.openedAt)}</span>
                        <span className="text-xs text-slate-500">{timeAgo(r.openedAt)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">{r.symbol}</td>
                    <td className="px-3 py-3">{exName}</td>
                    <td className="px-3 py-3">
                      {r.tp || r.sl ? (
                        <div className="flex flex-col">
                          <span className="text-emerald-700">TP: {r.tp ?? "—"}</span>
                          <span className="text-rose-700">SL: {r.sl ?? "—"}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3">{fmtLots(r.lotSize)}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ${
                          r.pnl >= 0
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-rose-50 text-rose-700 ring-rose-200"
                        }`}
                      >
                        {fmtPnL(r.pnl)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {r.closedAt ? (
                        <div className="flex flex-col">
                          <span>{fmtDate(r.closedAt)}</span>
                          <span className="text-xs text-slate-500">{timeAgo(r.closedAt)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Open</span>
                      )}
                    </td>
                    <td className="px-3 py-3">{r.userEmail}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-600">
                    No trades found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
