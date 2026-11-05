import type { WalletProvider } from "@/lib/withdrawal"

// ponytail: placeholder data URLs, replace with real logos
export const walletLogos: Record<WalletProvider, string> = {
  bkash: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23e2136e' width='48' height='48' rx='8'/%3E%3C/svg%3E",
  nagad: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23f15a22' width='48' height='48' rx='8'/%3E%3C/svg%3E",
  rocket: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%238b3a90' width='48' height='48' rx='8'/%3E%3C/svg%3E",
  upay: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23d6001c' width='48' height='48' rx='8'/%3E%3C/svg%3E",
}

