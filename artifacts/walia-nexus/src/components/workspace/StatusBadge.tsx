import { cn } from "@/lib/utils";

type Status = "live" | "private" | "building";

const CONFIGS: Record<Status, { label: string; classes: string; dot: string }> = {
  live: {
    label: "LIVE",
    classes: "bg-green-500/10 text-green-400 border-green-500/25",
    dot: "bg-green-400",
  },
  building: {
    label: "BUILDING",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    dot: "bg-amber-400",
  },
  private: {
    label: "PRIVATE",
    classes: "bg-white/5 text-white/50 border-white/10",
    dot: "bg-white/40",
  },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = CONFIGS[status] ?? CONFIGS.private;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest border uppercase",
        cfg.classes,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot, status === "live" && "animate-pulse")} />
      {cfg.label}
    </span>
  );
}
