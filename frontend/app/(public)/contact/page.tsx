import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact - Elite Vapor Vape and Smoke",
  description:
    "Contact Elite Vapor Vape and Smoke in Boise, ID. Visit us at 6990 W Overland Rd or call +1 (208) 957-5963.",
  openGraph: {
    title: "Contact - Elite Vapor Vape and Smoke",
    description: "Get in touch with Elite Vapor in Boise, ID.",
  },
};

export default function ContactPage() {
  return (
    <div className="flex flex-col bg-slate-100">
      {/* Structured data */}
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
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Get in touch
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Contact — Elite Vapor Vape and Smoke
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Have a question or need help? Send us a message or visit us in Boise.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,420px] lg:gap-10">

          {/* Left: contact form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Send us a message</h2>
            <p className="mt-1 text-sm text-slate-600">We aim to respond within one business day.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          {/* Right: store info + map */}
          <div className="space-y-6">
            {/* Store info card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-6 py-4">
                <h2 className="text-base font-bold text-white">Elite Vapor Vape and Smoke</h2>
                <p className="mt-0.5 text-xs text-slate-400">Boise, Idaho</p>
              </div>
              <div className="divide-y divide-slate-100 px-6 py-4">
                <div className="flex items-start gap-3 pb-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</p>
                    <p className="mt-0.5 text-sm font-medium text-slate-900">6990 W Overland Rd</p>
                    <p className="text-sm text-slate-700">Boise, ID 83709</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hours</p>
                    <p className="mt-0.5 text-sm font-medium text-slate-900">Open Daily</p>
                    <p className="text-sm font-semibold text-emerald-700">7 AM – 11 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                    <a
                      href="tel:+12089575963"
                      className="mt-0.5 block text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-indigo-700 hover:decoration-indigo-400"
                    >
                      +1 (208) 957-5963
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                    <a
                      href="mailto:info@elitevaporboise.com"
                      className="mt-0.5 block text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-indigo-700 hover:decoration-indigo-400"
                    >
                      info@elitevaporboise.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map embed */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <iframe
                title="Elite Vapor Vape and Smoke location"
                src="https://maps.google.com/maps?q=Elite+Vapor+6990+W+Overland+Rd+Boise+ID+83709&output=embed&z=15"
                width="100%"
                height="280"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
