import { useParams, useLocation } from "wouter";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PreviewFrame } from "@/components/workspace/PreviewFrame";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PreviewPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const projectId = params.id;
  const title = (new URLSearchParams(window.location.search).get("title")) ?? "Generated Project";

  if (!projectId) {
    navigate("/dashboard");
    return null;
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-4 h-full">
        {/* Back bar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Command Center
          </button>
          <span className="text-white/20">·</span>
          <span className="text-sm text-white/60 font-medium truncate">{title}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            LIVE
          </span>
        </motion.div>

        {/* Full-height preview frame */}
        <div className="flex-1 min-h-0">
          <PreviewFrame
            projectId={projectId}
            projectTitle={title}
            onClose={() => navigate("/dashboard")}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
