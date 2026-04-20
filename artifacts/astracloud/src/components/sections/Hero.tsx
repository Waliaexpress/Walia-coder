export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#3b82f6]/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span className="inline-block h-2 w-2 rounded-full bg-[#3b82f6]" />
              Launch-ready marketing site template · Dark by default
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight">
              Turn visitors into customers with a fast, polished marketing site.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/75 max-w-xl">
              AstraCloud helps teams explain their product clearly, build trust with social proof, and
              convert with clean pricing and frictionless contact flows—optimized for performance and clarity.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center rounded-lg bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:brightness-110 transition"
              >
                See plans
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/5 transition"
              >
                Explore features
              </a>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-6 max-w-xl">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs text-white/60">Typical setup</dt>
                <dd className="mt-1 text-2xl font-bold">1–2 days</dd>
                <dd className="mt-1 text-sm text-white/70">Copy-ready sections and conversion-focused layout.</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs text-white/60">Uptime target</dt>
                <dd className="mt-1 text-2xl font-bold">99.9%</dd>
                <dd className="mt-1 text-sm text-white/70">Built for reliability with simple, static delivery.</dd>
              </div>
            </dl>
          </div>

          <div className="lg:pl-10">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Conversion snapshot</div>
                <div className="text-xs text-white/60">Last 30 days</div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-[#0e1117]/60 p-4">
                  <div className="text-xs text-white/60">Page speed</div>
                  <div className="mt-1 flex items-end justify-between">
                    <div className="text-2xl font-bold">A+</div>
                    <div className="text-xs text-white/60">Core Web Vitals</div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[92%] rounded-full bg-[#3b82f6]" />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0e1117]/60 p-4">
                  <div className="text-xs text-white/60">Lead conversion</div>
                  <div className="mt-1 flex items-end justify-between">
                    <div className="text-2xl font-bold">+37%</div>
                    <div className="text-xs text-white/60">MoM</div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[70%] rounded-full bg-[#3b82f6]" />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0e1117]/60 p-4 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/60">Customer trust</div>
                    <div className="text-xs text-white/60">Proof that sells</div>
                  </div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {["SOC 2-ready|Security messaging included.", "Clear pricing|No hidden add-ons.", "Fast contact|Short form, higher completion."].map((item) => {
                      const [title, desc] = item.split("|");
                      return (
                        <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="text-sm font-semibold">{title}</div>
                          <div className="text-xs text-white/70 mt-1">{desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-8 w-8 shrink-0 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Everything you need to launch</div>
                    <p className="mt-1 text-sm text-white/70">
                      Hero, features, testimonials, pricing, and a contact form—structured for SEO and easy scanning.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-white/60">
              {["Mobile-first", "Accessible", "SEO-ready"].map((badge) => (
                <div key={badge} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center">
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
