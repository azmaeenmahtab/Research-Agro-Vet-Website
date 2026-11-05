import type { Metadata } from "next";
import { Roboto, Roboto_Mono, Anek_Bangla } from "next/font/google";
import HeroToastProvider from "@/components/providers/HeroToastProvider";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const anekBangla = Anek_Bangla({
  variable: "--font-anek-bangla",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Research Agro Vet — Medicated Veterinary Feed Premix & Livestock Nutrition",
  description: "গবাদিপশু, পোল্ট্রি ও মৎস্য খামারীদের জন্য অনুমোদিত Medicated Veterinary Feed Premix, মিল্ক বুস্টার ও পুষ্টি সম্পূরক।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${roboto.variable} ${robotoMono.variable} ${anekBangla.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-roboto),family-name:var(--font-anek-bangla),sans-serif]">
        <HeroToastProvider />
        {children}
      </body>
    </html>
  );
}
