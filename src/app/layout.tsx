import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";

export const metadata: Metadata = {
  title: "Brainder | Scientific Explanations Made Simple",
  description: "Get detailed, engaging explanations of scientific facts in multiple languages. Understand complex scientific concepts broken down into core ideas, background, applications, and interesting details.",
  keywords: ["science", "education", "explanations", "scientific facts", "learning", "multilingual"],
  authors: [{ name: "Brainder Team" }],
  openGraph: {
    title: "Brainder | Scientific Explanations Made Simple",
    description: "Get detailed, engaging explanations of scientific facts in multiple languages",
    type: "website",
    locale: "uk_UA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brainder | Scientific Explanations Made Simple",
    description: "Get detailed, engaging explanations of scientific facts in multiple languages",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${GeistSans.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
