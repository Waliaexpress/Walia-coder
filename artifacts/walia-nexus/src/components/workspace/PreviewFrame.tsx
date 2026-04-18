import { useState } from "react";
import { motion } from "framer-motion";
import { X, RefreshCw, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import { getPreviewUrl } from "@/services/projects.service";

interface PreviewFrameProps {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
}

export function PreviewFrame({ projectId, projectTitle, onClose }: PreviewFrameProps) {
  const [key, setKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const src = getPreviewUrl(projectId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col rounded-xl border border-white/[0.08] bg-[#0e1117] overflow-hidden shadow-2xl ${
        fullscreen ? "fixed inset-4 z-50" : "w-full"
      }`}
      style={fullscreen ? {} : { minHeight: 560 }}
    >
      {/* Browser chrome bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#1c2333] border-b border-white/[0.07] shrink-0">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
            title="Close preview"
          />
          <div className="w-3 h-3 rounded-full bg-amber-500/40" />
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 bg-[#0e1117] rounded-md px-3 py-1 border border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
          <span className="text-[11px] font-mono text-white/40 truncate">
            walia://preview/{projectId.split("-")[0]} — {projectTitle}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
            title="Reload preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
            title={fullscreen ? "Minimize" : "Maximize"}
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Close preview"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The live iframe */}
      <iframe
        key={key}
        src={src}
        title={`Preview: ${projectTitle}`}
        className="flex-1 w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </motion.div>
  );
}
