import type { Metadata } from "next"
import "./admin.css"

export const metadata: Metadata = { title: "Admin Dashboard — বরজাজ", description: "Admin panel" }

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>
        <div className="ad-root">{children}</div>
      </body>
    </html>
  )
}
