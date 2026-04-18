import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Terminal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "<2ms", label: "Global Latency" },
  { value: "500+", label: "Elite Teams" },
  { value: "SOC 2", label: "Certified" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
      {/* Grid background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
      </div>

      {/* Gradient overlay bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full">
        {/* Status badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/25 text-primary text-xs font-mono mb-8 uppercase tracking-widest"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
          Systems Operational · v2.1.0
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-[clamp(2.8rem,7vw,6rem)] font-black tracking-tighter leading-[0.92] mb-6 max-w-5xl"
        >
          Command
          <br />
          Infrastructure for{" "}
          <span
            className="relative inline-block"
            style={{
              background: "linear-gradient(135deg, #00f0ff 0%, #3b82f6 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Elite Teams.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10 font-mono"
        >
          Deploy, monitor, and scale intelligent systems with military-grade precision.
          The ultimate workspace for senior engineers who demand absolute control.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <Link href="/register">
            <Button
              size="lg"
              className="group h-14 px-8 text-sm font-black uppercase tracking-widest bg-primary text-[#080c14] hover:bg-primary/90 shadow-[0_0_32px_rgba(0,240,255,0.45)] hover:shadow-[0_0_48px_rgba(0,240,255,0.65)] transition-all w-full sm:w-auto"
            >
              Initialize Protocol
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-sm font-bold uppercase tracking-wider border-white/15 hover:bg-white/5 hover:border-white/30 transition-all w-full sm:w-auto group"
            >
              <Terminal className="w-4 h-4 mr-2 text-primary" />
              Access Console
            </Button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] rounded-xl overflow-hidden border border-white/[0.07]"
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-[#080c14] px-6 py-5 flex flex-col items-center justify-center text-center hover:bg-primary/5 transition-colors group"
            >
              <span className="text-2xl md:text-3xl font-black text-white group-hover:text-primary transition-colors">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
