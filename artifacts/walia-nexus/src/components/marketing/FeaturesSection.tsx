import { motion } from "framer-motion";
import { Server, ShieldCheck, Activity, Cpu, Globe, Lock } from "lucide-react";

const FEATURES = [
  {
    icon: Server,
    title: "Distributed Orchestration",
    desc: "Manage fleets of intelligent agents across global clusters with sub-millisecond coordination.",
    color: "text-cyan-400",
    glow: "rgba(0,240,255,0.15)",
  },
  {
    icon: ShieldCheck,
    title: "Fortified Security",
    desc: "Role-based access control, encrypted payloads, and audit trails ensure mission-critical isolation.",
    color: "text-green-400",
    glow: "rgba(34,197,94,0.12)",
  },
  {
    icon: Activity,
    title: "Real-time Telemetry",
    desc: "Profound observability into every node — latency, throughput, and error rates at a glance.",
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.12)",
  },
  {
    icon: Cpu,
    title: "AI-Native Runtime",
    desc: "Purpose-built for LLM pipelines, vector workloads, and multi-agent inference at scale.",
    color: "text-purple-400",
    glow: "rgba(168,85,247,0.12)",
  },
  {
    icon: Globe,
    title: "Global Edge Network",
    desc: "Deploy to 40+ regions in a single command. Automatic geo-routing and failover included.",
    color: "text-orange-400",
    glow: "rgba(251,146,60,0.12)",
  },
  {
    icon: Lock,
    title: "Compliance Ready",
    desc: "SOC 2 Type II certified with GDPR, HIPAA, and FedRAMP-ready deployment profiles.",
    color: "text-rose-400",
    glow: "rgba(251,113,133,0.12)",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <p className="text-primary font-mono text-xs uppercase tracking-[0.2em] mb-3">
            Capabilities
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Built for teams that{" "}
            <span className="text-primary">refuse to compromise.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Every feature is engineered for production-grade reliability — not prototypes.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="relative bg-[#080c14] p-8 group hover:bg-primary/[0.03] transition-all duration-300 cursor-default"
              style={{
                boxShadow: `inset 0 0 0 0 ${f.glow}`,
              }}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                style={{ background: f.glow, boxShadow: `0 0 20px ${f.glow}` }}
              >
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                <div
                  className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${f.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                  style={{ boxShadow: `0 0 8px currentColor` }}
                />
              </div>

              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
