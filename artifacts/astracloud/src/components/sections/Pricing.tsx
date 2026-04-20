const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "For founders validating a product idea.",
    features: [
      "1 marketing site",
      "All core sections (Hero, Features, Pricing)",
      "CDN delivery",
      "SSL certificate",
      "Community support",
    ],
    cta: { label: "Get started free", href: "#contact", primary: false },
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing teams that need more power.",
    badge: "Most popular",
    features: [
      "Everything in Starter",
      "5 marketing sites",
      "Custom domain + DNS",
      "A/B testing on CTAs",
      "Analytics dashboard",
      "Priority email support",
    ],
    cta: { label: "Start free trial", href: "#contact", primary: true },
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For companies with compliance and scale needs.",
    features: [
      "Everything in Pro",
      "Unlimited sites",
      "SSO & audit logs",
      "SLA-backed uptime",
      "Dedicated success manager",
      "SOC 2 compliance package",
    ],
    cta: { label: "Talk to sales", href: "#contact", primary: false },
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
          <p className="mt-3 text-white/75">
            No hidden add-ons. No surprise charges. Pick the plan that fits your team.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.highlighted
                  ? "border-[#3b82f6]/60 bg-[#3b82f6]/10 ring-1 ring-[#3b82f6]/30"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-[#3b82f6] px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-500/30">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-white/60">{plan.period}</span>}
                </div>
                <p className="mt-2 text-sm text-white/70">{plan.description}</p>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/80">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={plan.cta.href}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  plan.cta.primary
                    ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30 hover:brightness-110"
                    : "border border-white/15 text-white/90 hover:bg-white/5"
                }`}
              >
                {plan.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
