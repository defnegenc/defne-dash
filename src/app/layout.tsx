import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "defne dash",
  description: "defne's dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div aria-hidden className="aero-swirl" />
        <div aria-hidden className="aero-bloom" />
        <div aria-hidden className="aero-bubble one" />
        <div aria-hidden className="aero-bubble two" />
        {children}
      </body>
    </html>
  );
}
