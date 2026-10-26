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
  title: "Research Agro Vet — অনুমোদিত ভেটেরিনারি ঔষধ ও ফার্মাসিউটিক্যালস",
  description: "গবাদিপশু, পোল্ট্রি ও মৎস্য খামারীদের জন্য অনুমোদিত ভেটেরিনারি প্রেসক্রিপশন ড্রাগ, মিল্ক বুস্টার ও পুষ্টি সম্পূরক।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
