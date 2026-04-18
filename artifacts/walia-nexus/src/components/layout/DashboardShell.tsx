import { ReactNode, useState } from "react";
import { Link, Redirect, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  CreditCard,
  Cpu,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Admin", href: "/dashboard/admin", icon: Users, adminOnly: true },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href}>
      <div
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group ${
          active
            ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
            : "text-white/40 hover:text-white hover:bg-white/[0.04] border border-transparent"
        }`}
      >
        {active && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-blue-500"
          />
        )}
        <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-400" : "text-white/30 group-hover:text-white/60"}`} />
        <span>{item.label}</span>
      </div>
    </Link>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const displayName = user?.email?.split("@")[0] ?? "user";

  return (
    <div
      className="w-64 flex flex-col h-full"
      style={{ background: "#1c2333", borderRight: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.05]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="font-black text-white text-sm tracking-tight leading-none">WALIA</p>
            <p className="text-[9px] text-amber-400 font-mono uppercase tracking-[0.15em]">Nexus</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors md:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Workspace Dropdown */}
      <div className="px-3 py-3 border-b border-white/[0.05]">
        <button
          onClick={() => setWorkspaceOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-black text-[10px]">{displayName[0]?.toUpperCase()}</span>
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white truncate">{displayName}&apos;s Workspace</p>
              <p className="text-[10px] text-white/30 font-mono truncate">{user?.email}</p>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-white/30 flex-shrink-0 transition-transform duration-200 ${workspaceOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {workspaceOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-1 py-1 px-1 space-y-0.5">
                <div className="px-3 py-1.5 text-[10px] text-white/20 font-mono uppercase tracking-widest">
                  Role: {user?.role}
                </div>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-red-500/8 text-white/40 hover:text-red-400 text-xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 px-3 mb-3">
          Navigation
        </p>
        {NAV.filter((item) => !item.adminOnly || isAdmin).map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={
              item.href === "/dashboard"
                ? location === "/dashboard"
                : location.startsWith(item.href)
            }
          />
        ))}
      </nav>

      {/* Bottom user row */}
      <div className="px-3 py-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[11px]">{displayName[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/70 truncate">{displayName}</p>
            <p className="text-[10px] text-white/25 font-mono uppercase">{user?.role}</p>
          </div>
          <button
            onClick={() => logout()}
            className="w-6 h-6 flex items-center justify-center rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return <Redirect to="/login" />;

  return (
    <div className="min-h-screen flex w-full" style={{ background: "#0e1117", color: "#e2e8f0" }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#1c2333" }}>
          <button onClick={() => setMobileOpen(true)} className="text-white/50 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-black text-white text-sm tracking-tight">WALIA NEXUS</span>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto w-full px-6 py-8 md:px-10 md:py-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
