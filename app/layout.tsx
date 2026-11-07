'use client'

import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/superadmin');

  if (isAdmin) {
    return (
      <html lang="bn">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="bn">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
