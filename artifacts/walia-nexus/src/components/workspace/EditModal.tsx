import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditModalProps {
  open: boolean;
  project: { id: string; title: string; stack: string | null; status: string } | null;
  isPending: boolean;
  onSave: (id: string, data: { title: string; stack: string; status: string }) => void;
  onClose: () => void;
}

export function EditModal({ open, project, isPending, onSave, onClose }: EditModalProps) {
  const [title, setTitle] = useState("");
  const [stack, setStack] = useState("");
  const [status, setStatus] = useState("building");

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setStack(project.stack ?? "");
      setStatus(project.status);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !title.trim()) return;
    onSave(project.id, { title: title.trim(), stack: stack.trim(), status });
  };

  return (
    <AnimatePresence>
      {open && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isPending ? onClose : undefined}
          />

          <motion.div
            className="relative z-10 w-full max-w-md rounded-2xl border border-blue-500/20 bg-[#1c2333] shadow-[0_0_40px_rgba(59,130,246,0.12)] overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />

            <div className="p-8">
              <button
                onClick={onClose}
                disabled={isPending}
                className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-1">Edit Project</h2>
              <p className="text-xs text-white/30 font-mono mb-6">Modify the parameters for this deployment.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Project Title
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-[#0e1117] border-white/10 focus:border-blue-500/50 text-white placeholder:text-white/20"
                    placeholder="Project name"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Tech Stack
                  </Label>
                  <Input
                    value={stack}
                    onChange={(e) => setStack(e.target.value)}
                    className="bg-[#0e1117] border-white/10 focus:border-blue-500/50 text-white placeholder:text-white/20"
                    placeholder="e.g. React • Node • PostgreSQL"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-[#0e1117] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c2333] border-white/10">
                      <SelectItem value="building">Building</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-white/10 hover:bg-white/5 text-white/70"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
