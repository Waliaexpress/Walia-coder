import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Zap,
  Paperclip,
  Upload,
  HardDrive,
  Image as ImageIcon,
  Code2,
  Network,
  Figma,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";

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

const POWER_LEVELS = [
  { id: "draft", label: "Draft", desc: "Fast, cheap" },
  { id: "power", label: "Power", desc: "Balanced" },
  { id: "max", label: "Max", desc: "Deep reasoning" },
];

export function CommandPrompt({ username, onGenerate, isGenerating }: CommandPromptProps) {
  const [prompt, setPrompt] = useState("");
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length));
  const [contextOpen, setContextOpen] = useState(false);
  const [powerOpen, setPowerOpen] = useState(false);
  const [powerLevel, setPowerLevel] = useState("power");
  const [planMode, setPlanMode] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [figmaPrompt, setFigmaPrompt] = useState(false);
  const [figmaUrl, setFigmaUrl] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const powerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextOpen && contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextOpen(false);
      }
      if (powerOpen && powerMenuRef.current && !powerMenuRef.current.contains(e.target as Node)) {
        setPowerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [contextOpen, powerOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    const planPrefix = planMode ? "[PLAN MODE — outline architecture before writing code]\n\n" : "";
    const attachContext = attachments.length > 0 ? `\n\nAttached context: ${attachments.join(", ")}` : "";
    onGenerate(planPrefix + prompt.trim() + attachContext);
    setPrompt("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) setAttachments((prev) => [...prev, ...files.map((f) => f.name)]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeAndAttach = (label: string) => {
    setContextOpen(false);
    setAttachments((p) => [...p, label]);
  };

  const triggerUpload = () => {
    setContextOpen(false);
    fileInputRef.current?.click();
  };

  const submitFigma = () => {
    if (figmaUrl.trim()) setAttachments((prev) => [...prev, `Figma: ${figmaUrl.trim()}`]);
    setFigmaUrl("");
    setFigmaPrompt(false);
  };

  const displayName = username.split("@")[0] ?? username;
  const currentPower = POWER_LEVELS.find((p) => p.id === powerLevel) ?? POWER_LEVELS[1];

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
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-file-upload"
        />

        <div
          className={`relative rounded-2xl border transition-all duration-300 px-4 pt-4 ${
            isGenerating
              ? "border-amber-500/30 shadow-[0_0_32px_rgba(245,158,11,0.12)]"
              : "border-white/[0.08] hover:border-white/20 focus-within:border-blue-500/40 focus-within:shadow-[0_0_32px_rgba(59,130,246,0.1)]"
          } bg-[#1c2333]`}
        >
          {/* Attachment chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {attachments.map((name, i) => (
                <motion.span
                  key={`${name}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-mono"
                >
                  {name.length > 32 ? name.slice(0, 30) + "…" : name}
                  <button
                    type="button"
                    onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}
                    className="hover:text-white ml-1"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
            rows={3}
            disabled={isGenerating}
            className="w-full bg-transparent text-white placeholder:text-white/20 resize-none text-sm font-mono leading-relaxed focus:outline-none disabled:opacity-50"
            data-testid="input-prompt"
          />

          {/* Action Hub bar */}
          <div className="flex items-center justify-between w-full pt-3 mt-2 border-t border-gray-800">
            {/* LEFT: status / hint */}
            <div className="flex items-center gap-2 text-[10px] text-white/25 font-mono">
              <span className="hidden sm:inline">⌘ + Enter to send</span>
            </div>

            {/* RIGHT: Power · Plan · Context · Generate */}
            <div className="flex items-center gap-2 relative">
              {/* Power dropdown */}
              <div className="relative" ref={powerMenuRef}>
                <button
                  type="button"
                  onClick={() => setPowerOpen((v) => !v)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-mono text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  data-testid="button-power"
                >
                  {currentPower.label}
                  <ChevronDown className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {powerOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full right-0 mb-2 bg-[#2b2d31] border border-gray-700/50 rounded-xl shadow-2xl py-2 w-44 z-50"
                    >
                      {POWER_LEVELS.map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => {
                            setPowerLevel(lvl.id);
                            setPowerOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-700/50 text-gray-200 text-[14px] transition-colors"
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-mono text-xs">{lvl.label}</span>
                            <span className="text-[10px] text-gray-500">{lvl.desc}</span>
                          </div>
                          {powerLevel === lvl.id && <Check className="w-3 h-3 text-blue-400" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Plan toggle */}
              <button
                type="button"
                onClick={() => setPlanMode((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors ${
                  planMode
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                    : "text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent"
                }`}
                data-testid="button-plan"
              >
                <span
                  className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                    planMode ? "bg-blue-500 border-blue-500" : "border-gray-500"
                  }`}
                >
                  {planMode && <Check className="w-2.5 h-2.5 text-white" />}
                </span>
                Plan
              </button>

              {/* Context Trigger (paperclip) — sits next to Generate */}
              <div className="relative" ref={contextMenuRef}>
                <button
                  type="button"
                  onClick={() => setContextOpen((v) => !v)}
                  className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
                  aria-label="Add context"
                  data-testid="button-context"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Master Context Menu */}
                <AnimatePresence>
                  {contextOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute bottom-full right-0 mb-2 w-56 z-50 bg-[#2b2d31] border border-gray-700/50 rounded-xl shadow-2xl py-2"
                      data-testid="menu-context"
                    >
                      <CtxItem
                        icon={<Paperclip className="w-4 h-4" />}
                        label="Upload files"
                        onClick={triggerUpload}
                        testId="menu-upload-files"
                      />
                      <CtxItem
                        icon={<HardDrive className="w-4 h-4 text-blue-400" />}
                        label="Add from Drive"
                        onClick={() => closeAndAttach("Drive")}
                        testId="menu-drive"
                      />
                      <CtxItem
                        icon={<ImageIcon className="w-4 h-4 text-emerald-400" />}
                        label="Photos"
                        onClick={() => closeAndAttach("Photos")}
                        testId="menu-photos"
                      />
                      <CtxItem
                        icon={<Code2 className="w-4 h-4 text-purple-400" />}
                        label="Import code"
                        onClick={() => closeAndAttach("Import code")}
                        testId="menu-import-code"
                      />
                      <CtxItem
                        icon={<Network className="w-4 h-4 text-cyan-400" />}
                        label="NotebookLM"
                        onClick={() => closeAndAttach("NotebookLM")}
                        testId="menu-notebooklm"
                      />
                      <CtxItem
                        icon={<Figma className="w-4 h-4 text-pink-400" />}
                        label="Attach a Figma design"
                        onClick={() => {
                          setContextOpen(false);
                          setFigmaPrompt(true);
                        }}
                        testId="menu-figma"
                      />
                      <CtxItem
                        icon={<Sparkles className="w-4 h-4 text-amber-400" />}
                        label="Use a skill"
                        chevron
                        onClick={() => closeAndAttach("Skill")}
                        testId="menu-skill"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Generate button */}
              <motion.button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-[0_0_18px_rgba(59,130,246,0.25)]"
                data-testid="button-generate"
              >
                {isGenerating ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                ) : (
                  <><Zap className="w-3.5 h-3.5" /> Generate</>
                )}
              </motion.button>
            </div>
          </div>

          <div className="h-3" />
        </div>

        {/* Figma URL prompt modal */}
        <AnimatePresence>
          {figmaPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setFigmaPrompt(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1c2333] border border-gray-700 rounded-xl p-5 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Figma className="w-4 h-4 text-pink-400" />
                  <h3 className="text-sm font-semibold text-white">Attach Figma design</h3>
                </div>
                <p className="text-xs text-gray-400 mb-3">Paste the public Figma file URL.</p>
                <input
                  type="url"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  placeholder="https://www.figma.com/file/..."
                  autoFocus
                  className="w-full bg-[#0e1117] border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && submitFigma()}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setFigmaPrompt(false)}
                    className="px-3 py-1.5 rounded-md text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitFigma}
                    className="px-3 py-1.5 rounded-md text-xs bg-blue-500 text-white font-semibold hover:bg-blue-400 transition-colors"
                  >
                    Attach
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

interface CtxItemProps {
  icon: React.ReactNode;
  label: string;
  chevron?: boolean;
  onClick: () => void;
  testId?: string;
}

function CtxItem({ icon, label, chevron, onClick, testId }: CtxItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-700/50 text-gray-200 cursor-pointer text-[14px] transition-colors"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {chevron && <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
    </button>
  );
}
