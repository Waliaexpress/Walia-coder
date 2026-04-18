import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, Building2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Scout",
    icon: Zap,
    price: "$0",
    period: "/month",
    tagline: "For individuals exploring the platform.",
    cta: "Deploy Free",
    ctaVariant: "outline" as const,
    features: ["1 Active Project", "1 GB Storage", "Basic Telemetry", "Community Support", "Public Clusters"],
    iconColor: "text-muted-foreground",
    glow: false,
  },
  {
    name: "Operator",
    icon: Shield,
    price: "$49",
    period: "/month",
    tagline: "For professional teams shipping fast.",
    cta: "Start Commanding",
    ctaVariant: "default" as const,
    features: ["10 Active Projects", "50 GB Storage", "Advanced Diagnostics", "Priority Support", "Custom Domains", "RBAC Controls"],
    iconColor: "text-primary",
    glow: true,
    popular: true,
  },
  {
    name: "Command",
    icon: Building2,
    price: "Custom",
    period: "",
    tagline: "For enterprises with zero-downtime demands.",
    cta: "Contact Command",
    ctaVariant: "outline" as const,
    features: ["Unlimited Projects", "Dedicated Clusters", "SLA & 24/7 Support", "On-Premise Deployment", "Custom Compliance", "Audit Logs"],
    iconColor: "text-purple-400",
    glow: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-28 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-mono text-xs uppercase tracking-[0.2em] mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Requisition your tier.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No hidden fees. No vendor lock-in. Scale up or down at any time.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? "border-primary/50 bg-primary/[0.03] scale-[1.04] shadow-[0_0_48px_rgba(0,240,255,0.12)]"
                  : "border-white/[0.07] bg-[#080c14] hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-[#080c14] text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center ${plan.popular ? "bg-primary/15 border border-primary/30" : "bg-white/5 border border-white/10"}`}>
                    <plan.icon className={`w-4.5 h-4.5 ${plan.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-8">
                  <span className={`text-5xl font-black ${plan.popular ? "text-primary" : "text-white"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.popular ? "text-primary" : "text-white/30"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.name === "Command" ? "#" : "/register"}>
                  <Button
                    className={`w-full font-bold uppercase tracking-wider text-xs h-11 ${
                      plan.popular
                        ? "bg-primary text-[#080c14] hover:bg-primary/90 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                        : "border-white/15 hover:bg-white/5"
                    }`}
                    variant={plan.ctaVariant}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
