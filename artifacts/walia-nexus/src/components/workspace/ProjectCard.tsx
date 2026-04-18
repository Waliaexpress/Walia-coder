import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, Clock, Play } from "lucide-react";
import { useLocation } from "wouter";
import { StatusBadge } from "./StatusBadge";

interface Project {
  id: string;
  title: string;
  stack: string | null;
  status: "live" | "private" | "building";
  createdAt: string | Date;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}

export function ProjectCard({ project, index, onEdit, onDelete }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const [, navigate] = useLocation();

  const stackTags = project.stack
    ? project.stack.split(/\s*[•·|,]\s*/).filter(Boolean)
    : [];

  const timeAgo = (date: string | Date) => {
    const ms = Date.now() - new Date(date).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const openPreview = () => {
    navigate(`/dashboard/preview/${project.id}?title=${encodeURIComponent(project.title)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-xl border border-white/[0.07] bg-[#1c2333] overflow-hidden group transition-all duration-200 hover:border-blue-500/30 hover:shadow-[0_0_24px_rgba(59,130,246,0.08)] flex flex-col cursor-pointer"
      onClick={openPreview}
    >
      {/* Blue top accent line on hover */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 to-blue-400"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ transformOrigin: "left" }}
      />

      {/* Preview overlay on hover */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-blue-500/5 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold">
          <Play className="w-3 h-3 fill-current" />
          Launch Preview
        </div>
      </motion.div>

      <div className="p-5 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 flex-1">
            {project.title}
          </h3>
          <StatusBadge status={project.status} className="shrink-0 mt-0.5" />
        </div>

        {/* Stack tags */}
        {stackTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {stackTags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/8 text-blue-400/80 border border-blue-500/15"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/30 font-mono">
          <Clock className="w-3 h-3" />
          {timeAgo(project.createdAt)}
        </div>
      </div>

      {/* Footer actions */}
      <div
        className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between bg-white/[0.02]"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[10px] font-mono text-white/20 truncate max-w-[80px]">
          #{project.id.split("-")[0]}
        </span>

        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(project)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            title="Edit project"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(project)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Revoke project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
