import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-slate-100">
      {/* Hero strip */}
      <section className="w-full border-b border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-indigo-100 py-6 sm:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:px-6 lg:px-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-800 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Our story
          </div>
          <h1 className="text-left text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            About Elite Vapor
          </h1>
          <p className="max-w-2xl text-left text-sm text-slate-600 sm:text-base">
            Your trusted source for premium vaping products and accessories.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8 lg:p-10">
          {/* Intro */}
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700">
              Elite Vapor is dedicated to offering quality vaping products and accessories.
              We focus on reliability, variety, and customer satisfaction.
            </p>
          </div>

          {/* Store interior – placeholder images */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900">Our store</h2>
            <p className="mt-2 text-slate-600">
              Step inside Elite Vapor. These photos give you a glimpse of our space and product displays.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <div className="flex h-full w-full items-center justify-center text-slate-500">
                    <span className="text-sm font-medium">Store interior image {i}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Replace the placeholders above with real photos of the inside of your Elite Vapor store.
            </p>
          </section>

          {/* Values / what we offer */}
          <section className="mt-12 border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-bold text-slate-900">What we offer</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900">Wide selection</h3>
                <p className="mt-2 text-slate-600">
                  From disposables to devices and e-liquids, we stock a range of products across categories.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900">Quality first</h3>
                <p className="mt-2 text-slate-600">
                  We choose products we trust so you can shop with confidence.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900">Here to help</h3>
                <p className="mt-2 text-slate-600">
                  Questions? Reach out through our Contact page and we’ll get back to you.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center rounded-xl border border-indigo-600 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-indigo-500 hover:bg-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white"
            >
              Browse products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-slate-600 hover:bg-slate-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
