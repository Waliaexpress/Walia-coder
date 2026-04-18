import { motion } from "framer-motion";

const LOGOS = [
  "Vercel", "Stripe", "Linear", "Supabase", "Cloudflare",
  "PlanetScale", "Retool", "Notion", "Figma", "GitHub",
];

export function SocialProofBanner() {
  return (
    <div className="relative py-12 border-y border-white/[0.05] bg-[#060a11] overflow-hidden">
      <p className="text-center text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground/50 mb-8">
        Trusted by engineering teams at
      </p>

      {/* Scrolling ticker */}
      <div className="relative flex overflow-hidden gap-0">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#060a11] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#060a11] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-12 items-center whitespace-nowrap flex-shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span
              key={i}
              className="text-sm font-bold text-white/20 tracking-widest uppercase hover:text-white/50 transition-colors cursor-default select-none"
              style={{ letterSpacing: "0.15em" }}
            >
              {logo}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
