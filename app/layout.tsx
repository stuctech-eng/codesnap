import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeSnap",
  description: "Jouw snippet bibliotheek",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CodeSnap",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="CodeSnap" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
