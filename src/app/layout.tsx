import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TechPeppy — Software Architecture, AI Systems & Desk Setups",
  description:
    "Modern engineering publication covering software architecture, applied AI systems, data pipelines, tech news, and developer workspaces.",
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
    title: "TechPeppy — Software Architecture, AI Systems & Desk Setups",
    description: "Modern engineering publication by Sandeep Kumar.",
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
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-white text-[#111315]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
