import "./admin.css"

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
