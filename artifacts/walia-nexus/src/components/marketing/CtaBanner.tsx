import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
      </div>

      {/* Grid */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono mb-8 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Ready to deploy
          </div>

          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
            Your infrastructure.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00f0ff 0%, #3b82f6 60%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your command.
            </span>
          </h2>

          <p className="text-lg text-muted-foreground font-mono max-w-xl mx-auto mb-10">
            Join hundreds of teams that rely on Walia Nexus to run their most critical systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="group h-14 px-10 font-black uppercase tracking-widest text-sm bg-primary text-[#080c14] hover:bg-primary/90 shadow-[0_0_40px_rgba(0,240,255,0.5)] hover:shadow-[0_0_56px_rgba(0,240,255,0.7)] transition-all"
              >
                Initialize Protocol
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 font-bold uppercase tracking-wider border-white/15 hover:bg-white/5 hover:border-white/30"
              >
                Access Console
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
