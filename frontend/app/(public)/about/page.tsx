import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us - Elite Vapor Vape and Smoke Shop",
  description:
    "Learn about Elite Vapor Vape and Smoke Shop in Boise, ID. Hours, location, and everything you need to know about our store.",
  openGraph: {
    title: "About Us - Elite Vapor Vape and Smoke Shop",
    description: "Your trusted vape and smoke shop in Boise, ID — Elite Vapor.",
  },
};

const STORE_HOURS = [
  { day: "Monday", hours: "7 AM – 11 PM" },
  { day: "Tuesday", hours: "7 AM – 11 PM" },
  { day: "Wednesday", hours: "7 AM – 11 PM" },
  { day: "Thursday", hours: "7 AM – 11 PM" },
  { day: "Friday", hours: "7 AM – 11 PM" },
  { day: "Saturday", hours: "7 AM – 11 PM" },
  { day: "Sunday", hours: "7 AM – 11 PM" },
];

function getTodayIndex() {
  // 0 = Sunday in JS, we reorder to Monday first
  const jsDay = new Date().getDay(); // 0=Sun,1=Mon,...,6=Sat
  const reordered = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun
  return reordered.indexOf(jsDay);
}

export default function AboutPage() {
  const todayIndex = getTodayIndex();

  return (
    <div className="flex flex-col bg-slate-100">
      {/* Structured data for local business */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Elite Vapor Vape and Smoke",
            address: {
              "@type": "PostalAddress",
              streetAddress: "6990 W Overland Rd",
              addressLocality: "Boise",
              addressRegion: "ID",
              postalCode: "83709",
              addressCountry: "US",
            },
            telephone: "+12089575963",
            openingHours: ["Mo-Su 07:00-23:00"],
            url: "https://www.elitevaporboise.com",
          }),
        }}
      />

      {/* Hero strip */}
      <section className="w-full border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 py-10 sm:py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:px-6 lg:px-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Our story
          </div>
          <h1 className="text-left text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            About Us — Elite Vapor Vape and Smoke Shop
          </h1>
          <p className="max-w-2xl text-left text-sm text-slate-300 sm:text-base">
            Your trusted vape and smoke shop in Boise, Idaho — quality products, knowledgeable staff, unbeatable prices.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

          {/* About copy + hero image */}
          <section className="grid gap-8 p-6 sm:p-8 lg:p-10 lg:gap-10 lg:grid-cols-[3fr,2fr] lg:items-start">
            <div className="max-w-none">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Elite Vapor Vape and Smoke</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                Elite Vapor is a modern vape and smoke shop located in Boise, Idaho, dedicated to
                providing high-quality vaping products, smoke shop accessories, and outstanding
                customer service to our local community. Our mission is to create a welcoming
                environment where both new and experienced customers can explore the latest products
                in the vaping industry with confidence.
              </p>

              <h3 className="mt-8 text-lg font-semibold text-slate-900 sm:text-xl">
                Quality Products You Can Trust
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                At Elite Vapor, we carefully select products from the most trusted and recognized
                brands. Our inventory includes disposable vapes, premium e-liquids, pod systems,
                vape devices, coils, and accessories for all experience levels.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                We regularly carry Geek Bar, Lost Mary, Off Stamp, Raz, and many other
                industry-leading manufacturers known for quality and reliability.
              </p>

              <h3 className="mt-8 text-lg font-semibold text-slate-900 sm:text-xl">
                Devices, Flavors, and Accessories
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed text-slate-700 sm:text-base space-y-1">
                <li>Disposable vape devices</li>
                <li>Pod systems and refillable vape kits</li>
                <li>Nicotine salt and freebase e-liquids</li>
                <li>Replacement pods and coils</li>
                <li>Batteries, chargers, and vape accessories</li>
                <li>Smoke shop accessories</li>
              </ul>

              <h3 className="mt-8 text-lg font-semibold text-slate-900 sm:text-xl">
                Customer Experience
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed text-slate-700 sm:text-base space-y-1">
                <li>Friendly and knowledgeable service</li>
                <li>Competitive pricing</li>
                <li>Clean, welcoming store environment</li>
                <li>Access to the newest products on the market</li>
              </ul>
            </div>

            {/* Store hours card */}
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 shadow-xl">
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20">
                      <svg className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <circle cx="12" cy="12" r="10" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">Store Hours</p>
                      <p className="text-[11px] text-slate-400">Open 7 days a week</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    {STORE_HOURS.map((entry, idx) => {
                      const isToday = idx === todayIndex;
                      return (
                        <div
                          key={entry.day}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                            isToday
                              ? "bg-indigo-500 text-white shadow-md shadow-indigo-900/40"
                              : "text-slate-300 hover:bg-slate-700/50"
                          }`}
                        >
                          <span className={`font-medium ${isToday ? "text-white" : "text-slate-200"}`}>
                            {entry.day}
                            {isToday && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                                Today
                              </span>
                            )}
                          </span>
                          <span className={`font-semibold tabular-nums ${isToday ? "text-white" : "text-emerald-400"}`}>
                            {entry.hours}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-lg bg-emerald-500/15 px-3 py-2.5 text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Open Daily</p>
                    <p className="mt-0.5 text-lg font-bold text-white">7 AM – 11 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Store interior images */}
          <section className="border-t border-slate-100 px-6 pt-6 pb-6 sm:px-8 sm:pt-8">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Our Store</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Take a look inside Elite Vapor — clean, modern, and stocked with the latest products.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <Image
                  src="/images/interior-image-1.jpeg"
                  alt="Display of products inside Elite Vapor"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <Image
                  src="/images/interior-image-2.jpeg"
                  alt="Another view of products inside Elite Vapor"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            </div>
          </section>

          {/* Visit & contact details */}
          <section className="border-t border-slate-100 px-6 pt-6 pb-8 sm:px-8 sm:pt-8">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Visit Elite Vapor</h2>
            <p className="mt-2 text-slate-700">
              Come visit us at our Boise location — we are open every day.
            </p>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">Address</dt>
                <dd className="mt-1 text-slate-800">
                  6990 W Overland Rd
                  <br />
                  Boise, ID 83709
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">Hours</dt>
                <dd className="mt-1 font-medium text-slate-800">Open Daily: 7 AM – 11 PM</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">Phone</dt>
                <dd className="mt-1">
                  <a
                    href="tel:+12089575963"
                    className="text-slate-800 underline decoration-slate-300 underline-offset-4 transition hover:text-indigo-700 hover:decoration-indigo-400"
                  >
                    +1 (208) 957-5963
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">Email</dt>
                <dd className="mt-1">
                  <a
                    href="mailto:info@elitevaporboise.com"
                    className="text-slate-800 underline decoration-slate-300 underline-offset-4 transition hover:text-indigo-700 hover:decoration-indigo-400"
                  >
                    info@elitevaporboise.com
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center rounded-xl border border-indigo-600 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-indigo-500 hover:bg-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Browse products
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-slate-600 hover:bg-slate-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Contact us
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
