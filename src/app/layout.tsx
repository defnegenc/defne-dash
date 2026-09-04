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
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=chillax@500,600,700&display=swap" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=technor@400,700&display=swap" />
      </head>
      <body className="font-sans antialiased">
        {/* Lightning CSS strips the unprefixed backdrop-filter and keeps only
            the -webkit- alias, which current Chrome removed - so the real
            blur lives here, untouched by the CSS pipeline. Keep values in
            sync with the glass classes in globals.css. */}
        <style>{`
          .vglass { backdrop-filter: blur(120px) saturate(1.5) brightness(1.07); }
          .vglass-panel, .vglass-bar { backdrop-filter: blur(120px) saturate(1.5) brightness(1.08); }
          .vchip { backdrop-filter: blur(64px) saturate(1.5) brightness(1.06); }
          .card-visual { backdrop-filter: blur(80px) saturate(1.5) brightness(1.06); }
          .glass { backdrop-filter: blur(56px) saturate(1.5) brightness(1.06); }
          .glass-inset { backdrop-filter: blur(40px) saturate(1.3) brightness(1.05); }
          .glass-chip { backdrop-filter: blur(36px) saturate(1.3) brightness(1.05); }
        `}</style>
        <SkyCanvas />
        <AeroBg />
        {children}
      </body>
    </html>
  );
}
