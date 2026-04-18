import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CommandPrompt } from "@/components/workspace/CommandPrompt";
import { ProjectCard } from "@/components/workspace/ProjectCard";
import { DeleteModal } from "@/components/workspace/DeleteModal";
import { EditModal } from "@/components/workspace/EditModal";
import { useAuth } from "@/lib/auth";
import { useGetProjectsSummary, useListProjects } from "@workspace/api-client-react";
import {
  useDeleteProjectMutation,
  useUpdateProjectMutation,
  useGenerateMutation,
} from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { Box, Globe, Activity, Lock, Loader2 } from "lucide-react";

interface ProjectShape {
  id: string;
  title: string;
  stack: string | null;
  status: "live" | "private" | "building";
  createdAt: string | Date;
}

const METRIC_CONFIG = [
  { key: "total", label: "Total Projects", icon: Box, color: "text-white/70", glow: "rgba(255,255,255,0.05)" },
  { key: "live", label: "Live Systems", icon: Globe, color: "text-green-400", glow: "rgba(34,197,94,0.1)" },
  { key: "building", label: "In Progress", icon: Activity, color: "text-amber-400", glow: "rgba(245,158,11,0.1)" },
  { key: "private", label: "Private Vaults", icon: Lock, color: "text-blue-400", glow: "rgba(59,130,246,0.1)" },
] as const;

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { data: summary } = useGetProjectsSummary();
  const { data: projects, isLoading } = useListProjects();

  const deleteMutation = useDeleteProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const generateMutation = useGenerateMutation();

  const [deleteTarget, setDeleteTarget] = useState<ProjectShape | null>(null);
  const [editTarget, setEditTarget] = useState<ProjectShape | null>(null);

  const handleGenerate = (prompt: string) => {
    generateMutation.mutate(prompt, {
      onSuccess: (result) => {
        // Navigate to live preview — the HTML is now stored and ready
        navigate(
          `/dashboard/preview/${result.projectId}?title=${encodeURIComponent(result.project.title)}`
        );
      },
      onError: (e) => {
        toast({ title: "Generation Failed", description: (e as Error).message, variant: "destructive" });
      },
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast({ title: "Project Revoked", description: deleteTarget.title });
        setDeleteTarget(null);
      },
      onError: (e) => {
        toast({ title: "Failed to Revoke", description: e.message, variant: "destructive" });
        setDeleteTarget(null);
      },
    });
  };

  const handleSaveEdit = (id: string, data: { title: string; stack: string; status: string }) => {
    updateMutation.mutate(
      { id, payload: data as { title: string; stack: string; status: "live" | "private" | "building" } },
      {
        onSuccess: () => {
          toast({ title: "Project Updated" });
          setEditTarget(null);
        },
        onError: (e) => {
          toast({ title: "Update Failed", description: (e as Error).message, variant: "destructive" });
        },
      }
    );
  };

  const recentProjects: ProjectShape[] = (projects ?? []).slice(0, 8).map((p) => ({
    ...p,
    stack: p.stack ?? null,
    status: p.status as "live" | "private" | "building",
    createdAt: p.createdAt,
  }));

  return (
    <DashboardShell>
      {/* Command Center */}
      <section className="py-8 md:py-12">
        <CommandPrompt
          username={user?.email ?? "operator"}
          onGenerate={handleGenerate}
          isGenerating={generateMutation.isPending}
        />
      </section>

      {/* Stats row */}
      <section className="mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {METRIC_CONFIG.map((m, i) => {
            const val = summary ? (summary as Record<string, number>)[m.key] ?? 0 : 0;
            return (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="rounded-xl border border-white/[0.06] p-5 flex flex-col gap-3 hover:border-white/15 transition-colors"
                style={{ background: "#1c2333" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-white/30">{m.label}</p>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: m.glow }}>
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                </div>
                <p className={`text-3xl font-black ${m.color}`}>
                  {summary ? val : <span className="opacity-30">—</span>}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Recent Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Deployments</h2>
            <p className="text-xs text-white/30 font-mono mt-0.5">Your latest project activity</p>
          </div>
          {generateMutation.isPending && (
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating...
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-xl border border-white/[0.05] animate-pulse"
                style={{ background: "#1c2333", animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-xl border border-white/[0.05] border-dashed"
            style={{ background: "rgba(28,35,51,0.4)" }}
          >
            <Box className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 font-mono text-sm">No projects yet — initialize your first build above.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {recentProjects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  onEdit={(p) => setEditTarget(p as ProjectShape)}
                  onDelete={(p) => setDeleteTarget(p as ProjectShape)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Modals */}
      <DeleteModal
        open={!!deleteTarget}
        projectTitle={deleteTarget?.title ?? ""}
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <EditModal
        open={!!editTarget}
        project={editTarget}
        isPending={updateMutation.isPending}
        onSave={handleSaveEdit}
        onClose={() => setEditTarget(null)}
      />
    </DashboardShell>
  );
}
