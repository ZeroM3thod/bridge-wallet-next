'use client'

import { AppStateProvider } from "@/components/app/AppState";
import BorojajApp from "@/components/BorojajApp";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <BorojajApp>{children}</BorojajApp>
    </AppStateProvider>
  );
}
