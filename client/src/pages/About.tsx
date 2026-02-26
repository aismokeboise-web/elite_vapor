import { Link } from "react-router-dom";

export function About() {
  return (
    <div className="relative min-h-[calc(100vh-2rem-3.5rem)] overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-cyan-50/50">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(148 163 184 / 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184 / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "2.5rem 2.5rem",
        }}
        aria-hidden
      />
      {/* Decorative gradient orbs */}
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl" aria-hidden />
      <div className="absolute right-1/3 top-1/2 h-48 w-48 rounded-full bg-cyan-300/15 blur-2xl" aria-hidden />

      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-900/5">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <section>
            <h2 className="text-xl font-semibold text-slate-900">Our story</h2>
            <p className="mt-2 text-slate-600">
              We started with a simple goal: offer a wide selection of reliable
              products at fair prices, with clear information and honest
              advice. Whether you’re new to vaping or looking for your next
              favorite device or flavor, we’re here to support you.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">
              What we offer
            </h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
              <li>Devices — pod systems, mods, and starter kits</li>
              <li>Vape juice — e-liquids in a range of flavors and strengths</li>
              <li>Disposables — convenient, ready-to-use options</li>
              <li>Accessories — coils, batteries, and more</li>
              <li>Nicotine pouches and papers</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">
              Our commitment
            </h2>
            <p className="mt-2 text-slate-600">
              We care about quality, safety, and customer service. We work with
              trusted brands and stand behind what we sell. If you have
              questions or need help choosing a product, our team is here for
              you.
            </p>
          </section>

          {/* Inside store photos */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">
              Inside the shop
            </h2>
            <p className="mt-2 text-slate-600">
              Take a look inside our store — a bright, welcoming space where you can browse devices,
              flavors, and accessories in person.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src="/image-1.jpg"
                  alt="Interior of Empire Vapor Shop"
                  className="h-56 w-full object-cover sm:h-64"
                />
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src="/image-2.jpg"
                  alt="Display shelves inside Empire Vapor Shop"
                  className="h-56 w-full object-cover sm:h-64"
                />
              </div>
            </div>
          </section>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="inline-flex items-center rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              View products
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-lg border-2 border-cyan-500 bg-cyan-50 px-5 py-2.5 text-sm font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Contact us
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
