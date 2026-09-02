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
      <body className="font-sans antialiased">
        <AeroBg />
        {children}
      </body>
    </html>
  );
}
