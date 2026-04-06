"use client"

import { useState, useEffect } from "react"
import { CreditCard, Loader2, Search, TrendingUp, Banknote, ArrowUpRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function PaymentsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/finance/payments?search=${search}`)
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(fetchPayments, 300)
    return () => clearTimeout(t)
  }, [search])

  const methodLabels: Record<string, string> = {
    CASH: "Наличные",
    TRANSFER: "Перевод",
    CARD: "Карта",
  }
  const methodColors: Record<string, string> = {
    CASH: "#22c55e",
    TRANSFER: "#6366f1",
    CARD: "#f59e0b",
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>История оплат</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Все платежи и транзакции клиентов</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#f0faf4" }}>
            <TrendingUp size={22} style={{ color: "#22c55e" }} />
          </div>
          <div>
            <div className="text-sm" style={{ color: "#6b7280" }}>Всего получено</div>
            <div className="text-xl font-bold" style={{ color: "#111827" }}>
              {formatCurrency(data?.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0)}
            </div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#f0f4ff" }}>
            <Banknote size={22} style={{ color: "#6366f1" }} />
          </div>
          <div>
            <div className="text-sm" style={{ color: "#6b7280" }}>Наличными</div>
            <div className="text-xl font-bold" style={{ color: "#111827" }}>
              {formatCurrency(data?.payments?.filter((p: any) => p.method === "CASH").reduce((s: number, p: any) => s + p.amount, 0) || 0)}
            </div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#fffbeb" }}>
            <ArrowUpRight size={22} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <div className="text-sm" style={{ color: "#6b7280" }}>Переводом</div>
            <div className="text-xl font-bold" style={{ color: "#111827" }}>
              {formatCurrency(data?.payments?.filter((p: any) => p.method === "TRANSFER").reduce((s: number, p: any) => s + p.amount, 0) || 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "#e5e7eb" }}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" className="form-input pl-9" placeholder="Поиск по клиенту, заказу..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="animate-spin" size={32} style={{ color: "#22c55e" }} />
            </div>
          ) : data?.payments?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <CreditCard size={40} className="mb-3 text-gray-300" />
              <p className="text-gray-500">Платежей не найдено</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата оплаты</th>
                  <th>Клиент</th>
                  <th>Заказ</th>
                  <th>Способ оплаты</th>
                  <th>Сумма</th>
                  <th>Заметка</th>
                </tr>
              </thead>
              <tbody>
                {data?.payments?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="text-sm text-gray-700">{new Date(p.paidAt).toLocaleDateString("ru-RU")}</td>
                    <td className="font-medium text-sm" style={{ color: "#1a3a2e" }}>{p.client?.name || "—"}</td>
                    <td className="text-sm text-gray-600">{p.order?.orderNumber || "—"}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: (methodColors[p.method] || "#6b7280") + "18", color: methodColors[p.method] || "#6b7280" }}>
                        {methodLabels[p.method] || p.method}
                      </span>
                    </td>
                    <td className="font-bold" style={{ color: "#22c55e" }}>{formatCurrency(p.amount)}</td>
                    <td className="text-sm text-gray-500">{p.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
