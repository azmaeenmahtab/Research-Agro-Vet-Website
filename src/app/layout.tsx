import type { Metadata } from "next";
import { Geist, Geist_Mono, Anek_Bangla } from "next/font/google";
import HeroToastProvider from "@/components/providers/HeroToastProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anekBangla = Anek_Bangla({
  variable: "--font-anek-bangla",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Research Agro Vet — Medicated Veterinary Feed Premix & Livestock Nutrition",
  description: "গবাদিপশু, পোল্ট্রি ও মৎস্য খামারীদের জন্য অনুমোদিত Medicated Veterinary Feed Premix, মিল্ক বুস্টার ও পুষ্টি সম্পূরক।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${anekBangla.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-anek-bangla),family-name:var(--font-geist-sans),sans-serif]">
        <HeroToastProvider />
        {children}
      </body>
    </html>
  );
}
