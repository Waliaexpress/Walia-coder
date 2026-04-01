import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-sm border border-primary/50 text-primary font-bold">
            W
          </div>
          <span className="font-bold tracking-tight text-lg text-white">WALIA NEXUS</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-white">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-background font-medium transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              INITIALIZE
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
