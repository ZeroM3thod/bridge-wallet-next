import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "বরজাজ — Bridge Wallet",
  description: "ব্রিজ ওয়ালেট",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
