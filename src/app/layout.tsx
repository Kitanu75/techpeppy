import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechPeppy — The Pulse of Tech & Developer Discussions",
  description:
    "Join TechPeppy.com to discover and share desk setups, hardware reviews, AI breakthroughs, and developer discussions with Reddit-style voting and nested comments.",
  keywords: ["Tech", "Community", "Desk Setups", "Gadgets", "AI", "Software Development", "Reddit"],
  authors: [{ name: "TechPeppy Team" }],
  openGraph: {
    title: "TechPeppy — Tech Community Platform",
    description: "Share setup photos, gadget reviews, and developer discussions.",
    url: "https://techpeppy.com",
    siteName: "TechPeppy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0d0f15]">{children}</body>
    </html>
  );
}
