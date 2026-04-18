import { motion } from "framer-motion";
import { Link } from "wouter";
import { Cpu, Github, Twitter, ExternalLink } from "lucide-react";

const FOOTER_LINKS = {
  Platform: ["Overview", "Features", "Pricing", "Changelog"],
  Developers: ["Documentation", "API Reference", "SDK", "Status"],
  Company: ["About", "Blog", "Careers", "Security"],
  Legal: ["Privacy", "Terms", "Cookie Policy", "DPA"],
};

export function FooterSection() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060a11] relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-primary/15 border border-primary/40 text-primary font-black text-sm">
                W
              </div>
              <span className="font-black tracking-tight text-white text-base">
                WALIA <span className="text-primary">NEXUS</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
              Command infrastructure for elite engineering teams. Built for those who demand control.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-white/25 transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-white/25 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="col-span-1">
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">{section}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-mono">
              © {new Date().getFullYear()} Walia Nexus. All systems operational.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
