import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Brain — Morning Briefing",
  description: "Your daily knowledge dashboard. Built on the Open Brain architecture with idirnet design principles.",
  keywords: ["knowledge management", "daily briefing", "productivity", "open brain", "idirnet"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
