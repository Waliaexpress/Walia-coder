import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, MinusCircle, HelpCircle, GitBranch, RefreshCw } from "lucide-react";

type SyncStatus = "success" | "failed" | "skipped" | "unknown" | "error";

interface SyncStatusData {
  status: SyncStatus;
  timestamp?: string;
  reason?: string;
  exitCode?: number;
}

const STATUS_CONFIG: Record<
  SyncStatus,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string; glow: string }
> = {
  success: {
    label: "Synced",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "rgba(34,197,94,0.08)",
    border: "border-green-500/20",
    glow: "rgba(34,197,94,0.15)",
  },
  failed: {
    label: "Sync Failed",
    icon: XCircle,
    color: "text-red-400",
    bg: "rgba(239,68,68,0.10)",
    border: "border-red-500/30",
    glow: "rgba(239,68,68,0.2)",
  },
  skipped: {
    label: "Sync Skipped",
    icon: MinusCircle,
    color: "text-amber-400",
    bg: "rgba(245,158,11,0.08)",
    border: "border-amber-500/20",
    glow: "rgba(245,158,11,0.12)",
  },
  unknown: {
    label: "No Sync Yet",
    icon: HelpCircle,
    color: "text-white/30",
    bg: "rgba(255,255,255,0.03)",
    border: "border-white/[0.06]",
    glow: "transparent",
  },
  error: {
    label: "Status Error",
    icon: HelpCircle,
    color: "text-white/30",
    bg: "rgba(255,255,255,0.03)",
    border: "border-white/[0.06]",
    glow: "transparent",
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

export function GitHubSyncBadge() {
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

  const status: SyncStatus = data?.status ?? "unknown";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
  const Icon = cfg.icon;

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
    </motion.div>
  );
}
