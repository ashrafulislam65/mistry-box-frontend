import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mistry-box-frontend.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Darazz Mystery Box | ড্যারাজ মিস্ট্রি বক্স",
  description: "আপনার ঘর ও কাজের জন্য দরকারি টুলস, রেডি বক্সে — সরাসরি আপনার দরজায় ক্যাশ অন ডেলিভারিতে।",
  keywords: ["মিস্ট্রি বক্স", "mistry box", "tool box bangladesh", "cash on delivery", "darazz"],
  openGraph: {
    siteName: "Darazz Mystery Box",
    locale: "bn_BD",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}