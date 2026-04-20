const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
      </svg>
    ),
    title: "Clear positioning",
    description: "Headline, subhead, and proof blocks built to communicate value in under 10 seconds.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Social proof engine",
    description: "Testimonial cards, company logos, and stat callouts calibrated to build trust fast.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Transparent pricing",
    description: "Three-tier pricing table with a recommended highlight, feature lists, and clear CTAs.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Frictionless contact",
    description: "Short lead-capture form with clear labels, inline validation, and success confirmation.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Performance-first",
    description: "No heavy frameworks or runtime JS. Ships as minimal, production-ready HTML and Tailwind.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2v-1H6v1a2 2 0 002 2zM12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17h8v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" />
      </svg>
    ),
    title: "SEO & accessibility",
    description: "Semantic HTML, descriptive alt text, proper heading order, and meta-tag structure.",
  },
];

export default function Features() {
  return (
    <section id="features" className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Features that make your value obvious</h2>
          <p className="mt-3 text-white/75">
            Every section is designed to answer buyer questions quickly: what it is, why it matters,
            how it works, and what it costs.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition"
            >
              <div className="h-10 w-10 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="mt-4 font-semibold text-lg">{feature.title}</h3>
              <p className="mt-2 text-sm text-white/75">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
