import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter instead of Geist
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "그린뉴메틱 (Green Pneumatic) - 산업 기술의 새로운 기준",
  description: "실험장비, 콤프레샤, 진공 및 유체시스템 전문 기업 그린뉴메틱입니다.",
};


import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingButtons } from "@/components/layout/floating-buttons";

import { ProgressBar } from "@/components/ui/progress-bar";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          inter.variable
        )}
      >
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
