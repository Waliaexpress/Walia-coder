import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";

function ContactSection() {
  return (
    <section id="contact" className="border-t border-white/10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Ready to launch?</h2>
        <p className="mt-3 text-white/75">
          Book a 20-minute demo and we'll show you exactly how AstraCloud turns your messaging into revenue.
        </p>

        <form
          className="mt-10 grid gap-4 sm:grid-cols-2 text-left"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5" htmlFor="contact-name">
              Full name
            </label>
            <input
              id="contact-name"
              type="text"
              placeholder="Jane Smith"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#3b82f6]/60 focus:outline-none focus:ring-1 focus:ring-[#3b82f6]/30 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5" htmlFor="contact-email">
              Work email
            </label>
            <input
              id="contact-email"
              type="email"
              placeholder="jane@company.com"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#3b82f6]/60 focus:outline-none focus:ring-1 focus:ring-[#3b82f6]/30 transition"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/70 mb-1.5" htmlFor="contact-message">
              What are you building?
            </label>
            <textarea
              id="contact-message"
              rows={4}
              placeholder="Tell us about your product and what you're trying to achieve…"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#3b82f6]/60 focus:outline-none focus:ring-1 focus:ring-[#3b82f6]/30 transition resize-none"
            />
          </div>
          <div className="sm:col-span-2 flex justify-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#3b82f6] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:brightness-110 transition"
            >
              Book a demo
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0e1117] text-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
