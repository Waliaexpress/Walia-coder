import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";

export default function NotFound() {
  useSEO({ title: "404 Not Found" });

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center relative z-10"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-card border border-destructive/20 rounded-full mb-8 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-6xl font-bold tracking-tighter mb-4 text-white">404</h1>
        <p className="text-xl text-muted-foreground font-mono mb-8 max-w-md mx-auto">
          System registry error. The requested coordinate could not be located in the databank.
        </p>
        <Link href="/">
          <Button className="bg-white/10 hover:bg-white/20 text-white font-mono uppercase tracking-widest border border-white/20">
            Return to Base
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
