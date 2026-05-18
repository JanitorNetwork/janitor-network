import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TJChat from "@/components/TJChat";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Janitor Network — Bitcoin secures money. The Janitor secures trust.",
  description:
    "Trust intelligence for the crypto era. Scan wallets and token addresses for public risk signals. Powered by $CLEAN.",
  keywords: [
    "crypto trust",
    "token scanner",
    "wallet scanner",
    "rug pull detector",
    "solana scanner",
    "crypto safety",
    "CLEAN token",
    "janitor network",
    "defi risk",
  ],
  openGraph: {
    title: "The Janitor Network",
    description: "Bitcoin secures money. The Janitor secures trust.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <WelcomeOverlay />
        <Navbar />
        <main className="flex-1">{children}</main>
        <TJChat />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
