import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  RefreshCw,
  Loader2,
  User,
  Bot,
  Copy,
  Check,
  Code2,
  Eye,
  MessageSquare,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import { useLocation } from "wouter";

const getBase = () => (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("walia_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface Props {
  projectId: string;
  projectTitle: string;
}

type PaneMode = "tri" | "code" | "preview" | "chat";

export function ActiveWorkspace({ projectId, projectTitle }: Props) {
  const [, navigate] = useLocation();

  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(true);
  const [codeError, setCodeError] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "sys-0",
      role: "assistant",
      content: `Project loaded. I have full context of the current code. Tell me what to change — e.g. "Make the header blue", "Add a pricing section", "Remove the footer".`,
      ts: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isIterating, setIsIterating] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");

  const [copied, setCopied] = useState(false);
  const [paneMode, setPaneMode] = useState<PaneMode>("tri");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load initial code
  useEffect(() => {
    setCodeLoading(true);
    fetch(`${getBase()}/api/projects/${projectId}/code`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        setCode(d.code ?? "");
        setCodeLoading(false);
      })
      .catch(() => {
        setCodeError("Failed to load project code.");
        setCodeLoading(false);
      });
  }, [projectId]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update iframe srcdoc when code changes (debounced slightly)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current && code) {
        iframeRef.current.srcdoc = code;
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [code]);

  const appendMsg = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleIterate = async () => {
    const prompt = chatInput.trim();
    if (!prompt || isIterating) return;

    setChatInput("");
    setIsIterating(true);
    setStreamBuffer("");

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: prompt, ts: Date.now() };
    appendMsg(userMsg);

    const assistantId = `a-${Date.now()}`;
    appendMsg({ id: assistantId, role: "assistant", content: "", ts: Date.now() });

    abortRef.current = new AbortController();
    let accumulated = "";

    try {
      const res = await fetch(`${getBase()}/api/projects/${projectId}/iterate`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ prompt, currentCode: code }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          const raw = event.slice(6).trim();
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              accumulated += parsed.content;
              setCode(accumulated);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: "Applying changes…" } : m
                )
              );
            }
            if (parsed.done) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: "Done! Changes applied to the preview." }
                    : m
                )
              );
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${(err as Error).message ?? "Iteration failed."}` }
            : m
        )
      );
    } finally {
      setIsIterating(false);
      setStreamBuffer("");
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleIterate();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      const html = iframeRef.current.srcdoc;
      iframeRef.current.srcdoc = "";
      setTimeout(() => { if (iframeRef.current) iframeRef.current.srcdoc = html; }, 50);
    }
  };

  const resetCode = () => {
    if (iframeRef.current && code) iframeRef.current.srcdoc = code;
  };

  return (
    <div className="flex flex-col h-screen bg-[#0e1117] overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-[#0e1117] shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <span className="text-gray-700 text-xs">/</span>
          <span className="text-white text-sm font-semibold truncate max-w-[280px]">{projectTitle}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Layout toggles */}
        <div className="flex items-center gap-1 bg-[#1c2333] border border-gray-800 rounded-lg p-0.5">
          {(
            [
              { id: "tri", icon: <div className="flex gap-0.5"><div className="w-1 h-3 bg-current rounded-sm"/><div className="w-1.5 h-3 bg-current rounded-sm"/><div className="w-1 h-3 bg-current rounded-sm"/></div>, label: "Tri-pane" },
              { id: "chat", icon: <MessageSquare className="w-3.5 h-3.5" />, label: "Chat only" },
              { id: "code", icon: <Code2 className="w-3.5 h-3.5" />, label: "Code only" },
              { id: "preview", icon: <Eye className="w-3.5 h-3.5" />, label: "Preview only" },
            ] as const
          ).map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPaneMode(btn.id)}
              title={btn.label}
              className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
                paneMode === btn.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-white hover:bg-gray-800"
              }`}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tri-Pane Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* PANE 1: Chat / Iteration Engine */}
        {(paneMode === "tri" || paneMode === "chat") && (
          <div
            className={`flex flex-col border-r border-gray-800 bg-[#0e1117] shrink-0 ${
              paneMode === "chat" ? "flex-1" : "w-[300px]"
            }`}
          >
            {/* Chat header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-mono text-gray-300 font-semibold">Iteration Engine</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 min-h-0">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3 h-3 text-blue-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-[#1c2333] border border-gray-800 text-gray-200 rounded-bl-none"
                      }`}
                    >
                      {msg.content || (
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Thinking…
                        </span>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3 h-3 text-gray-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="p-3 border-t border-gray-800 bg-[#0e1117]">
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isIterating || codeLoading}
                  placeholder={isIterating ? "Applying changes…" : "e.g. Make the header blue…"}
                  rows={2}
                  className="flex-1 bg-[#1c2333] border border-gray-800 focus:border-blue-500/50 text-white text-xs placeholder:text-gray-600 rounded-lg px-3 py-2 resize-none focus:outline-none transition-colors disabled:opacity-50 font-mono leading-relaxed"
                />
                <button
                  onClick={handleIterate}
                  disabled={!chatInput.trim() || isIterating || codeLoading}
                  className="w-9 h-auto flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white shrink-0"
                >
                  {isIterating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5 font-mono">Enter to send · Shift+Enter for newline</p>
            </div>
          </div>
        )}

        {/* PANE 2: Code Workbench */}
        {(paneMode === "tri" || paneMode === "code") && (
          <div
            className={`flex flex-col border-r border-gray-800 bg-[#0d1117] min-w-0 ${
              paneMode === "code" ? "flex-1" : "flex-1"
            }`}
          >
            {/* Code header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-mono text-gray-300 font-semibold">Code Workbench</span>
                {isIterating && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> AI editing…
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetCode}
                  title="Sync preview"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopyCode}
                  title="Copy code"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Code editor */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
              {codeLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
              ) : codeError ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-red-400 text-xs font-mono">{codeError}</p>
                </div>
              ) : (
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="w-full h-full bg-transparent text-gray-300 text-xs font-mono leading-relaxed resize-none focus:outline-none p-4 overflow-auto"
                  style={{
                    tabSize: 2,
                    caretColor: "#60a5fa",
                  }}
                />
              )}
            </div>

            {/* Code footer */}
            <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-mono text-gray-600">
                {code ? `${code.length.toLocaleString()} chars · ${code.split("\n").length} lines` : "—"}
              </span>
              <span className="text-[10px] font-mono text-gray-700">HTML · Tailwind CDN</span>
            </div>
          </div>
        )}

        {/* PANE 3: Live Preview */}
        {(paneMode === "tri" || paneMode === "preview") && (
          <div
            className={`flex flex-col bg-white min-w-0 ${
              paneMode === "preview" ? "flex-1" : "flex-1"
            }`}
          >
            {/* Preview header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0e1117] shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-mono text-gray-300 font-semibold">Live Preview</span>
                <span className="text-[10px] font-mono text-gray-600">· auto-refreshes on every change</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={refreshPreview}
                  title="Refresh preview"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`${getBase()}/api/projects/${projectId}/preview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in new tab"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* iframe */}
            <div className="flex-1 min-h-0 relative">
              {codeLoading ? (
                <div className="flex items-center justify-center h-full bg-[#0e1117]">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-xs font-mono">Loading preview…</p>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  srcDoc={code}
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-none"
                  style={{ background: "#fff" }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
