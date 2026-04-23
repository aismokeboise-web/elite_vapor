import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Elite Vapor Vape and Smoke Shop - Boise, ID",
  description:
    "Elite Vapor – trusted vape shop and smoke shop in Boise, ID. Find vapes, e-liquids, disposables, and accessories at competitive prices.",
  keywords: [
    "vape shop Boise",
    "smoke shop Boise",
    "e-liquids Boise",
    "disposable vapes Boise",
    "Elite Vapor",
    "vape store Idaho",
  ],
  authors: [{ name: "Elite Vapor Vape and Smoke" }],
  openGraph: {
    title: "Elite Vapor Vape and Smoke Shop - Boise, ID",
    description:
      "Trusted vape shop and smoke shop in Boise, ID. Find vapes, e-liquids, disposables, and accessories at competitive prices.",
    type: "website",
    locale: "en_US",
    siteName: "Elite Vapor Vape and Smoke",
  },
  icons: {
    icon: "/images/logo.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Elite Vapor Vape and Smoke",
  description:
    "Trusted vape shop and smoke shop in Boise, ID. Find vapes, e-liquids, disposables, and accessories at competitive prices.",
  url: "https://www.elitevaporboise.com",
  telephone: "+12089575963",
  email: "info@elitevaporboise.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "6990 W Overland Rd",
    addressLocality: "Boise",
    addressRegion: "ID",
    postalCode: "83709",
    addressCountry: "US",
  },
  openingHours: ["Mo-Su 07:00-23:00"],
  priceRange: "$$",
  sameAs: [
    "https://www.facebook.com",
    "https://www.instagram.com",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="dns-prefetch" href="https://maps.google.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

