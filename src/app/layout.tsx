import type { Metadata } from "next";
import "./globals.css";
import { AeroBg } from "@/components/aero-bg";

export const metadata: Metadata = {
  title: "defne dash",
  description: "defne's dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=chillax@500,600,700&display=swap" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=technor@400,700&display=swap" />
      </head>
      <body className="font-sans antialiased">
        <AeroBg />
        {children}
      </body>
    </html>
  );
}
