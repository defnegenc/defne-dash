import type { Metadata } from "next";
import "./globals.css";
import { AeroBg } from "@/components/aero-bg";
import { SkyCanvas } from "@/components/sky-canvas";

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
          href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap"
        />
      </head>
      <body className="font-sans antialiased">
        
        <SkyCanvas />
        <AeroBg />
        {children}
      </body>
    </html>
  );
}
