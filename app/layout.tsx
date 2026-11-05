import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

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
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
