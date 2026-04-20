const TESTIMONIALS = [
  {
    quote:
      "We launched our product page in two days and saw a 40% increase in demo requests within the first week. The layout just works.",
    name: "Sofia Martinez",
    role: "Head of Growth · Lattice Labs",
    initials: "SM",
    color: "bg-[#3b82f6]",
  },
  {
    quote:
      "Finally a dark-mode template that doesn't feel generic. Our conversion rate climbed from 2.1% to 3.8% after switching to this layout.",
    name: "Damien Okafor",
    role: "Founder · Meridian Analytics",
    initials: "DO",
    color: "bg-violet-500",
  },
  {
    quote:
      "The pricing section alone saved us three weeks of design back-and-forth. Prospects now understand our tiers without a sales call.",
    name: "Priya Rajan",
    role: "VP Marketing · FlowStack",
    initials: "PR",
    color: "bg-emerald-500",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Trusted by teams that ship</h2>
          <p className="mt-3 text-white/75">
            Real results from teams who replaced their generic site with a conversion-optimized layout.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-white/80 leading-relaxed">"{t.quote}"</p>
              </div>
              <footer className="mt-6 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-white/60">{t.role}</div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
