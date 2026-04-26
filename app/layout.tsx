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
      <body>{children}</body>
    </html>
  );
}
