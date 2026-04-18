import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteModalProps {
  open: boolean;
  projectTitle: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ open, projectTitle, isPending, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isPending ? onCancel : undefined}
          />

          {/* Dialog */}
          <motion.div
            className="relative z-10 w-full max-w-md rounded-2xl border border-red-500/20 bg-[#1c2333] shadow-[0_0_40px_rgba(239,68,68,0.15)] overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Red top bar */}
            <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

            <div className="p-8">
              {/* Close */}
              <button
                onClick={onCancel}
                disabled={isPending}
                className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>

              {/* Text */}
              <h2 className="text-xl font-bold text-white mb-2">Revoke Project?</h2>
              <p className="text-sm text-white/50 leading-relaxed mb-1">
                You are about to permanently destroy:
              </p>
              <p className="text-sm font-mono font-bold text-red-400 mb-5 truncate">
                &quot;{projectTitle}&quot;
              </p>
              <p className="text-xs text-white/30 leading-relaxed mb-8">
                This action is irreversible. All data, configurations, and deployments associated with this project will be purged from the system.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/5 text-white/70"
                  onClick={onCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_28px_rgba(239,68,68,0.5)] transition-all"
                  onClick={onConfirm}
                  disabled={isPending}
                >
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Revoking...</>
                  ) : (
                    "Revoke Project"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
