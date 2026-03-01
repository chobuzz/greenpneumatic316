import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter instead of Geist
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://greenpneumatic.com'),
  title: {
    default: "그린뉴메틱 (Green Pneumatic) - 실험 및 산업 장비 솔루션",
    template: "%s | 그린뉴메틱"
  },
  description: "실험장비, 콤프레샤, 진공 및 유체시스템 전문 기업 그린뉴메틱입니다. 최상이 기술 지원과 사후 관리를 약속드립니다.",
  alternates: {
    canonical: '/',
  },
  keywords: ["그린뉴메틱", "Green Pneumatic", "실험장비", "진공펌프", "콤프레샤", "유체시스템", "산업장비", "실험실 설비", "장비 수리"],
  authors: [{ name: "그린뉴메틱" }],
  creator: "그린뉴메틱",
  publisher: "그린뉴메틱",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "그린뉴메틱 (Green Pneumatic) - 산업 기술의 새로운 기준",
    description: "실험장비, 콤프레샤, 진공 및 유체시스템 전문 솔루션 제공",
    url: 'https://greenpneumatic.com',
    siteName: '그린뉴메틱',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "그린뉴메틱 (Green Pneumatic)",
    description: "실험장비 및 산업용 유체시스템 전문 기업",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  verification: {
    google: 'your-google-verification-code',
    other: {
      'naver-site-verification': ['your-naver-verification-code'],
    },
  },
};


import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingButtons } from "@/components/layout/floating-buttons";

import { ProgressBar } from "@/components/ui/progress-bar";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/json-ld";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "그린뉴메틱 (Green Pneumatic)",
    "url": "https://greenpneumatic.com",
    "logo": "https://greenpneumatic.com/favicon.ico",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+82-10-7392-9809",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://blog.naver.com/greenpneumatic" // Example, adjust if needed
    ]
  };

  return (
    <html lang="ko">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          inter.variable
        )}
      >
        <JsonLd data={organizationJsonLd} />
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <FloatingButtons />
      </body>
    </html>
  );
}
