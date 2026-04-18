import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap } from "lucide-react";

interface CommandPromptProps {
  username: string;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const PLACEHOLDER_EXAMPLES = [
  "e.g. Build a SaaS billing dashboard with Stripe and React",
  "e.g. Create an RBAC auth API with PostgreSQL and JWT",
  "e.g. Design a real-time analytics engine with WebSockets",
  "e.g. Scaffold a full-stack e-commerce platform with Next.js",
];

export function CommandPrompt({ username, onGenerate, isGenerating }: CommandPromptProps) {
  const [prompt, setPrompt] = useState("");
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const displayName = username.split("@")[0] ?? username;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Unified Architect · Active
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-3 leading-tight">
          Hi{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {displayName}
          </span>
          ,
          <br />
          what do you want to build?
        </h1>
        <p className="text-white/30 font-mono text-sm">
          Describe your goal — Walia will architect and scaffold it instantly.
        </p>
      </motion.div>

      {/* Prompt bar */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative"
      >
        <div
          className={`relative rounded-2xl border transition-all duration-300 ${
            isGenerating
              ? "border-amber-500/30 shadow-[0_0_32px_rgba(245,158,11,0.12)]"
              : "border-white/[0.08] hover:border-white/20 focus-within:border-blue-500/40 focus-within:shadow-[0_0_32px_rgba(59,130,246,0.1)]"
          } bg-[#1c2333]`}
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
            rows={3}
            disabled={isGenerating}
            className="w-full bg-transparent text-white placeholder:text-white/20 resize-none px-6 pt-5 pb-16 text-sm font-mono leading-relaxed focus:outline-none disabled:opacity-50"
          />

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-t border-white/[0.05]">
            <span className="text-[10px] text-white/20 font-mono">⌘ + Enter to send</span>

            <motion.button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-[#0e1117] font-black text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_28px_rgba(245,158,11,0.55)] transition-all"
            >
              {isGenerating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
              ) : (
                <><Zap className="w-3.5 h-3.5" /> Initiate Build</>
              )}
            </motion.button>
          </div>
        </div>

        {/* Generating overlay effect */}
        {isGenerating && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.05) 0%, transparent 100%)" }}
          />
        )}
      </motion.form>
    </div>
  );
}
