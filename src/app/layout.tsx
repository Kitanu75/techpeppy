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
  title: "TechPeppy — Software Architecture, AI Systems & Workstations",
  description:
    "Engineering publication and developer platform focused on decoupled software architecture, production AI/RAG orchestration, data pipelines, and workspace gear.",
  keywords: [
    "Software Architecture",
    "Headless CMS",
    "AI Systems",
    "RAG",
    "Data Science",
    "Desk Setups",
    "TechPeppy",
  ],
  authors: [{ name: "Sandeep Kumar" }, { name: "TechPeppy" }],
  openGraph: {
    title: "TechPeppy — Software Architecture, AI Systems & Workstations",
    description: "Engineering publication and developer platform by Sandeep Kumar.",
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
      <body className="min-h-full flex flex-col bg-[#0b0f17] text-[#f8fafc]">{children}</body>
    </html>
  );
}
