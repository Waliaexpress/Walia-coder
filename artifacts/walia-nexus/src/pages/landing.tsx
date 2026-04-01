import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Server, ShieldAlert, Cpu, Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Command Center" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 border border-primary/30 text-primary text-xs font-mono mb-6 uppercase tracking-widest"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Systems Operational
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight"
            >
              Command Infrastructure for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Elite Teams.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl font-mono leading-relaxed"
            >
              Deploy, monitor, and scale intelligent systems with military-grade precision. 
              The ultimate workspace for senior engineers who demand control.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all uppercase tracking-wider group">
                  Initialize Protocol
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base border-white/20 hover:bg-white/5 font-mono uppercase tracking-wider">
                  Access Console
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Tactical Capabilities</h2>
            <p className="text-muted-foreground font-mono">Uncompromising tools for system orchestration.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Distributed Orchestration", icon: Server, desc: "Manage fleets of intelligent agents across global clusters with sub-millisecond latency." },
              { title: "Fortified Security", icon: ShieldAlert, desc: "Role-based access control and encrypted payloads ensure mission-critical data remains isolated." },
              { title: "Telemetry & Diagnostics", icon: Activity, desc: "Real-time vitals and profound observability into every node of your infrastructure." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="bg-background border-white/10 hover:border-primary/50 transition-colors h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center text-primary mb-4 border border-primary/20">
                      <f.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Requisition Tiers</h2>
            <p className="text-muted-foreground font-mono">Scale your operational capacity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "$0", features: ["1 Active Project", "Basic Telemetry", "Community Support"] },
              { name: "Pro", price: "$49", features: ["10 Active Projects", "Advanced Diagnostics", "Priority Support", "Custom Domains"], isPopular: true },
              { name: "Enterprise", price: "Custom", features: ["Unlimited Projects", "Dedicated Clusters", "SLA & 24/7 Support", "On-Premise Deployment"] }
            ].map((plan, i) => (
              <Card key={i} className={`relative bg-card border-white/10 ${plan.isPopular ? 'border-secondary shadow-[0_0_30px_rgba(255,176,0,0.15)] scale-105 z-10' : ''}`}>
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                    Recommended
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline text-4xl font-bold">
                    {plan.price}
                    {plan.price !== "Custom" && <span className="text-sm text-muted-foreground ml-1 font-normal">/mo</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className={`w-5 h-5 ${plan.isPopular ? 'text-secondary' : 'text-primary'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className={`w-full ${plan.isPopular ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'bg-white/10 hover:bg-white/20'}`}>
                      Select Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-card">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0 opacity-50">
            <Cpu className="w-5 h-5" />
            <span className="font-bold tracking-wider">WALIA NEXUS © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm font-mono text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-primary transition-colors">Status</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
