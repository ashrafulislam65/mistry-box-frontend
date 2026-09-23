import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "মিস্ত্রি বক্স | Mistry Box",
  description: "আপনার ঘর ও কাজের জন্য দরকারি টুলস, রেডি বক্সে।",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}