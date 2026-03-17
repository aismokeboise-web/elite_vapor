import Link from "next/link";
import Image from "next/image";

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
            About Us
          </h1>
          <p className="max-w-2xl text-left text-sm text-slate-600 sm:text-base">
            Learn more about Elite Vapor, your modern vape and smoke shop in Boise, Idaho.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8 lg:p-10">
          {/* About Elite Vapor copy + hero image */}
          <section className="grid gap-8 lg:gap-10 lg:grid-cols-[3fr,2fr] lg:items-center">
            <div className="max-w-none">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Elite Vapor</h2>
              <p className="mt-4 text-sm text-slate-700 sm:text-base">
                Elite Vapor is a modern vape and smoke shop located in Boise, Idaho, dedicated to
                providing high-quality vaping products, smoke shop accessories, and outstanding
                customer service to our local community. Our mission is to create a welcoming
                environment where both new and experienced customers can explore the latest products
                in the vaping industry with confidence.
              </p>

              <h3 className="mt-8 text-lg font-semibold text-slate-900 sm:text-xl">
                Quality Products You Can Trust
              </h3>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                At Elite Vapor, we carefully select products from some of the most trusted and
                recognized brands in the vape industry. Our inventory includes a wide range of
                disposable vapes, premium e-liquids, pod systems, vape devices, coils, and
                accessories designed to meet different preferences and experience levels.
              </p>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                We regularly carry popular brands such as Geek Bar, Lost Mary, Off Stamp, Raz, and
                many other industry-leading manufacturers known for quality and reliability.
              </p>

              <h3 className="mt-8 text-lg font-semibold text-slate-900 sm:text-xl">
                Devices, Flavors, and Accessories
              </h3>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                Our store offers a complete selection of vaping products including:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 sm:text-base">
                <li>Disposable vape devices</li>
                <li>Pod systems and refillable vape kits</li>
                <li>Nicotine salt and freebase e-liquids</li>
                <li>Replacement pods and coils</li>
                <li>Batteries, chargers, and vape accessories</li>
              </ul>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                Whether you are looking for a simple disposable device or a more advanced setup, our
                team is here to help you find the right product.
              </p>

              <h3 className="mt-8 text-lg font-semibold text-slate-900 sm:text-xl">
                Customer Experience
              </h3>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                Customer satisfaction is at the heart of everything we do. At Elite Vapor, we focus
                on:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 sm:text-base">
                <li>Friendly and knowledgeable service</li>
                <li>Competitive pricing</li>
                <li>A clean and welcoming store environment</li>
                <li>Access to the newest products in the market</li>
              </ul>
              <p className="mt-2 text-sm text-slate-700 sm:text-base mb-4">
                We believe that every customer should feel comfortable, informed, and valued when
                visiting our store.
              </p>
            </div>

          </section>

          {/* Store interior images */}
          <section className="mt-6 sm:mt-8">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Our Store</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Take a look inside Elite Vapor. This photo showcases our interior and product
              displays so you know what to expect when you visit.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-6">
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
          <section className="mt-8 sm:mt-10 border-t border-slate-200 pt-8 sm:pt-10">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Visit Elite Vapor</h2>
            <p className="mt-2 text-slate-700">
              If you’re looking for a reliable vape shop in Boise with quality products and
              excellent service, Elite Vapor is here to help.
            </p>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Address
                </dt>
                <dd className="mt-1 text-slate-800">
                  6990 W Overland Rd
                  <br />
                  Boise, ID 83709
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Hours
                </dt>
                <dd className="mt-1 text-slate-800">Open Daily: 7:00 AM – 11:00 PM</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </dt>
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
                <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </dt>
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
          </section>

          <div className="mt-12 flex flex-wrap gap-4 justify-center sm:justify-start">
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
