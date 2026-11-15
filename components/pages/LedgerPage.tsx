import { useEffect, useState } from "react"
import { useAppState } from "@/components/app/AppState"
import RecordList from "@/components/app/RecordList"
import { money } from "@/lib/app-format"

type Transaction = { id: string; type: string; amount: number; label: string; createdAt: number }
export default function LedgerPage() {
  const { balance, changePage } = useAppState()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState("")
  useEffect(() => { fetch("/api/ledger", { credentials: "include", cache: "no-store" }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setTransactions(d.transactions) }).catch(e => setError(e.message || "ডেটা লোড করা যায়নি")) }, [])
  const deposits = transactions.filter(t => t.type === "credit" && t.label.includes("জমা")).reduce((sum, t) => sum + t.amount, 0)
  const withdrawals = transactions.filter(t => t.label.includes("উত্তোলন")).reduce((sum, t) => sum + t.amount, 0)
  return (
    <>
      {error && <p role="alert">{error}</p>}
        <RecordList
          title="লেনদেনের সোনালী খাতা"
          onNavigate={changePage}
          summary={[["বর্তমান ব্যালেন্স", `৳ ${balance.toLocaleString("bn-BD")}`], ["মোট জমা", money(deposits)], ["মোট উত্তোলন", money(withdrawals)]]}
          rows={transactions.map(t => [t.label === "অর্থ উত্তোলন" ? "উত্তোলন" : t.label, new Date(t.createdAt).toLocaleDateString("bn-BD"), `${t.type === "credit" ? "+" : "-"}${money(t.amount)}`, t.type === "credit"] as [string, string, string, boolean])}
        />
    </>
  )
}
