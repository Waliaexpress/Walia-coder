import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0e1117]/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-sm font-black tracking-tight text-white">AC</span>
            </div>
            <div className="leading-tight">
              <div className="font-semibold">AstraCloud</div>
              <div className="text-xs text-white/60">Marketing site that converts</div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <a className="hover:text-white transition" href="#features">Features</a>
            <a className="hover:text-white transition" href="#testimonials">Testimonials</a>
            <a className="hover:text-white transition" href="#pricing">Pricing</a>
            <a className="hover:text-white transition" href="#contact">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#pricing"
              className="hidden sm:inline-flex items-center rounded-lg border border-white/15 px-3 py-2 text-sm text-white/90 hover:bg-white/5 transition"
            >
              View pricing
            </a>
            <a
              href="#contact"
              className="inline-flex items-center rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:brightness-110 transition"
            >
              Book a demo
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/15 p-2 hover:bg-white/5 transition"
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4">
            <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
              {["#features|Features", "#testimonials|Testimonials", "#pricing|Pricing", "#contact|Contact"].map((item) => {
                const [href, label] = item.split("|");
                return (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/5 hover:text-white transition"
                  >
                    {label}
                  </a>
                );
              })}
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-[#3b82f6] px-3 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
              >
                Book a demo
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
