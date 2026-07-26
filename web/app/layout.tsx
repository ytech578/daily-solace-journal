import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Daily Solace Journal — Multi-Discipline Academic Publishing",
    template: "%s | Daily Solace Journal",
  },
  description:
    "Daily Solace Journal is a peer-reviewed, open-access multi-journal directory publishing original research across sciences, humanities, and engineering.",
  keywords: ["academic journal", "peer review", "open access", "research", "publication"],
  openGraph: {
    type: "website",
    siteName: "Daily Solace Journal",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
