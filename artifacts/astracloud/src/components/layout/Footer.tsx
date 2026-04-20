export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: "Features", href: "#features" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="#top" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#3b82f6] flex items-center justify-center">
                <span className="text-xs font-black text-white">AC</span>
              </div>
              <span className="font-semibold">AstraCloud</span>
            </a>
            <p className="mt-2 text-sm text-white/50 max-w-xs">
              The fastest way to turn visitors into customers.
            </p>
          </div>

          <nav className="flex flex-wrap gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {year} AstraCloud. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-white/40 hover:text-white/70 transition">Privacy</a>
            <a href="#" className="text-xs text-white/40 hover:text-white/70 transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
