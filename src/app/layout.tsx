import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader } from "@/components/layout/Loader";
import { ServiceWorker } from "@/components/layout/ServiceWorker";

export const metadata: Metadata = {
  title: "WIAL Global Chapter Network",
  description:
    "A governed WIAL website and chapter platform with multilingual coach discovery, reviewed chapter publishing, and dues workflows built for global chapter operations."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only sr-only-focusable fixed left-4 top-4 z-[60] rounded-md bg-white text-black shadow-md"
        >
          Skip to content
        </a>
        <Loader />
        <ServiceWorker />
        <div className="min-h-screen">
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
