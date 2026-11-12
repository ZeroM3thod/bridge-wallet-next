import type { Page } from "@/lib/app-navigation"
export default function SubPageShell({ title, onNavigate, children }: { title: string; onNavigate: (page: Page) => void; children: React.ReactNode }) {
  return (
    <main className="home-page page-content profile-settings">
      <h1 className="ps-title">{title}</h1>
      {children}
    </main>
  )
}
