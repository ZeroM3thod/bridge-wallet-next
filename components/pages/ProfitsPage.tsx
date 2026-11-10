import { useEffect, useState } from "react"
import { useAppState } from "@/components/app/AppState"
import RecordList from "@/components/app/RecordList"
import { bengaliNumber, money } from "@/lib/app-format"

type Profit = { id: string; name: string | null; day: number; amount: number; createdAt: number }

export default function ProfitsPage() {
  const { changePage } = useAppState()
  const [profits, setProfits] = useState<Profit[]>([])
  const [error, setError] = useState("")
  useEffect(() => {
    fetch("/api/work", { credentials: "include", cache: "no-store" })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setProfits(data.profits) })
      .catch(e => setError(e.message || "ডেটা লোড করা যায়নি"))
  }, [])
  const total = profits.reduce((sum, profit) => sum + profit.amount, 0)
  const today = new Date().toDateString()
  const todayTotal = profits.reduce((sum, profit) => sum + (new Date(profit.createdAt).toDateString() === today ? profit.amount : 0), 0)
  const monthTotal = profits.reduce((sum, profit) => { const date = new Date(profit.createdAt); return sum + (date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear() ? profit.amount : 0) }, 0)
  return <>
    {error && <p role="alert">{error}</p>}
    <RecordList
      title="লাভের রেকর্ড"
      onNavigate={changePage}
      summary={[["আজকের লাভ", money(todayTotal)], ["এই মাসে", money(monthTotal)], ["মোট লাভ", money(total)]]}
      rows={profits.map(profit => [`${profit.name || "প্যাকেজ"} · দিন ${bengaliNumber(profit.day)}`, new Date(profit.createdAt).toLocaleDateString("bn-BD"), `+${money(profit.amount)}`, true])}
    />
  </>
}
