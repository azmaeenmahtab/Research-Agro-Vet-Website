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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://researchagrovet.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Research Agro Vet - Veterinary Feed Premix Manufacturer",
    template: "%s | Research Agro Vet",
  },
  description:
    "গবাদিপশু, পোল্ট্রি ও মৎস্য খামারীদের জন্য অনুমোদিত Medicated Veterinary Feed Premix, মিল্ক বুস্টার ও পুষ্টি সম্পূরক।",
  applicationName: "Research Agro Vet",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: siteUrl,
    siteName: "Research Agro Vet",
    title: "Research Agro Vet - Veterinary Feed Premix Manufacturer",
    description:
      "গবাদিপশু, পোল্ট্রি ও মৎস্য খামারীদের জন্য অনুমোদিত Medicated Veterinary Feed Premix, মিল্ক বুস্টার ও পুষ্টি সম্পূরক।",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Research Agro Vet Logo",
        type: "image/png",
      },
      {
        url: "/images/logo.png",
        width: 584,
        height: 355,
        alt: "Research Agro Vet Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Research Agro Vet - Veterinary Feed Premix Manufacturer",
    description:
      "গবাদিপশু, পোল্ট্রি ও মৎস্য খামারীদের জন্য অনুমোদিত Medicated Veterinary Feed Premix, মিল্ক বুস্টার ও পুষ্টি সম্পূরক।",
    images: ["/images/og-image.png"],
  },
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
