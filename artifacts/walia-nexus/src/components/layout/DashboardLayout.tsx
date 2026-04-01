import { Link, Redirect } from "wouter";
import { useAuth } from "@/lib/auth";
import { ReactNode } from "react";
import { LogOut, LayoutDashboard, Settings, Users, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-sm border border-primary/50 text-primary">
              <FolderKanban className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-lg">WALIA NEXUS</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 px-2">Workspace</div>
          <Link href="/dashboard">
            <div className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-medium">Overview</span>
            </div>
          </Link>
          <Link href="/dashboard/projects">
            <div className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <FolderKanban className="w-4 h-4" />
              <span className="text-sm font-medium">Projects</span>
            </div>
          </Link>
          <Link href="/dashboard/subscription">
            <div className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Subscription</span>
            </div>
          </Link>
          
          {isAdmin && (
            <>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 mt-8 px-2">Admin</div>
              <Link href="/dashboard/admin">
                <div className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Users</span>
                </div>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-sm font-medium truncate">{user?.email}</div>
              <div className="text-xs text-muted-foreground font-mono uppercase">{user?.role}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} className="shrink-0 text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Glow effect at top */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />
        
        <header className="h-16 border-b border-border flex items-center px-6 md:hidden">
          <Link href="/dashboard" className="font-bold tracking-tight">WALIA NEXUS</Link>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
