import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, MinusCircle, HelpCircle, GitBranch, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type SyncStatus = "success" | "failed" | "skipped" | "unknown" | "error";

interface SyncStatusData {
  status: SyncStatus;
  timestamp?: string;
  reason?: string;
  exitCode?: number;
}

interface SyncHistoryEntry {
  status: SyncStatus;
  timestamp?: string;
  reason?: string;
  exitCode?: number;
}

interface SyncHistoryData {
  entries: SyncHistoryEntry[];
  total: number;
}

const STATUS_CONFIG: Record<
  SyncStatus,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string; glow: string; dot: string }
> = {
  success: {
    label: "Synced",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "rgba(34,197,94,0.08)",
    border: "border-green-500/20",
    glow: "rgba(34,197,94,0.15)",
    dot: "bg-green-400",
  },
  failed: {
    label: "Sync Failed",
    icon: XCircle,
    color: "text-red-400",
    bg: "rgba(239,68,68,0.10)",
    border: "border-red-500/30",
    glow: "rgba(239,68,68,0.2)",
    dot: "bg-red-400",
  },
  skipped: {
    label: "Sync Skipped",
    icon: MinusCircle,
    color: "text-amber-400",
    bg: "rgba(245,158,11,0.08)",
    border: "border-amber-500/20",
    glow: "rgba(245,158,11,0.12)",
    dot: "bg-amber-400",
  },
  unknown: {
    label: "No Sync Yet",
    icon: HelpCircle,
    color: "text-white/30",
    bg: "rgba(255,255,255,0.03)",
    border: "border-white/[0.06]",
    glow: "transparent",
    dot: "bg-white/20",
  },
  error: {
    label: "Status Error",
    icon: HelpCircle,
    color: "text-white/30",
    bg: "rgba(255,255,255,0.03)",
    border: "border-white/[0.06]",
    glow: "transparent",
    dot: "bg-white/20",
  },
};

function formatTimestamp(ts?: string): string {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

function formatRelativeTime(ts?: string): string {
  if (!ts) return "";
  try {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return ts ?? "";
  }
}

function HistoryRow({ entry }: { entry: SyncHistoryEntry }) {
  const cfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.unknown;
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-2 py-1">
      <Icon className={`w-3 h-3 flex-shrink-0 ${cfg.color}`} />
      <span className={`text-[10px] font-mono ${cfg.color} w-16 flex-shrink-0`}>
        {cfg.label.replace("Sync ", "").replace("No Sync Yet", "No sync")}
      </span>
      <span className="text-[10px] font-mono text-white/20 flex-1 truncate">
        {formatRelativeTime(entry.timestamp)}
      </span>
      {entry.reason && entry.status !== "success" && (
        <span
          className="text-[10px] font-mono text-white/20 truncate max-w-[100px]"
          title={entry.reason}
        >
          {entry.reason.split("\n")[0].slice(0, 40)}
        </span>
      )}
    </div>
  );
}

export function GitHubSyncBadge() {
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery<SyncStatusData>({
    queryKey: ["github-sync-status"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/github-sync-status`);
      if (!res.ok) throw new Error("Failed to fetch sync status");
      return res.json();
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery<SyncHistoryData>({
    queryKey: ["github-sync-history"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/github-sync-history?limit=20`);
      if (!res.ok) throw new Error("Failed to fetch sync history");
      return res.json();
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: historyOpen,
  });

  const status: SyncStatus = data?.status ?? "unknown";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
  const Icon = cfg.icon;

  const hasHistory = historyData && historyData.entries.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`rounded-xl border p-4 flex flex-col gap-2 ${cfg.border}`}
      style={{ background: cfg.bg }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-white/30" />
          <p className="text-[11px] font-mono uppercase tracking-widest text-white/30">GitHub Sync</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-white/20 hover:text-white/50 transition-colors disabled:cursor-not-allowed"
          title="Refresh sync status"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="h-5 w-24 rounded bg-white/[0.05] animate-pulse" />
      ) : (
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${cfg.color} flex-shrink-0`} />
          <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
        </div>
      )}

      {status === "failed" && data?.reason && (
        <p className="text-[11px] font-mono text-red-300/70 truncate" title={data.reason}>
          {data.reason}
        </p>
      )}

      {status === "skipped" && data?.reason && (
        <p className="text-[11px] font-mono text-amber-300/60 truncate" title={data.reason}>
          {data.reason}
        </p>
      )}

      {data?.timestamp && (
        <p className="text-[10px] font-mono text-white/20">{formatTimestamp(data.timestamp)}</p>
      )}

      {status === "failed" && (
        <div
          className="mt-1 rounded-lg px-3 py-2 text-[11px] font-mono text-red-300/80 border border-red-500/20"
          style={{ background: "rgba(239,68,68,0.06)" }}
        >
          Last push to GitHub failed — check the sync logs.
        </div>
      )}

      <button
        onClick={() => setHistoryOpen((o) => !o)}
        className="flex items-center gap-1 mt-1 text-[10px] font-mono text-white/20 hover:text-white/40 transition-colors w-fit"
      >
        {historyOpen ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
        History
      </button>

      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-lg border border-white/[0.06] px-3 py-2 flex flex-col divide-y divide-white/[0.04]"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              {historyLoading && (
                <div className="py-2 flex flex-col gap-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-3 rounded bg-white/[0.05] animate-pulse" />
                  ))}
                </div>
              )}
              {!historyLoading && !hasHistory && (
                <p className="text-[10px] font-mono text-white/20 py-2">No history yet.</p>
              )}
              {!historyLoading && hasHistory && (
                <div className="flex flex-col">
                  {historyData.entries.map((entry, i) => (
                    <HistoryRow key={i} entry={entry} />
                  ))}
                  {historyData.total > historyData.entries.length && (
                    <p className="text-[10px] font-mono text-white/15 pt-1">
                      +{historyData.total - historyData.entries.length} older entries
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
