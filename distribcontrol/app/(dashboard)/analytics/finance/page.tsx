"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Loader2, DollarSign, AlertCircle, CreditCard, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function FinanceAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/finance?days=30")
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const summary = data?.summary || {}

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Финансы</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Финансовая аналитика за последние 30 дней</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" size={36} style={{ color: "#22c55e" }} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Оборот продаж", value: formatCurrency(summary.totalSales || 0), icon: TrendingUp, color: "#22c55e", bg: "#f0faf4" },
              { label: "Получено оплат", value: formatCurrency(summary.monthIncome || 0), icon: DollarSign, color: "#6366f1", bg: "#eff6ff" },
              { label: "Долги (активные)", value: formatCurrency(summary.expectedDebts || 0), icon: AlertCircle, color: "#ef4444", bg: "#fef2f2" },
            ].map(c => (
              <div key={c.label} className="kpi-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                  <c.icon size={22} style={{ color: c.color }} />
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#6b7280" }}>{c.label}</div>
                  <div className="text-xl font-bold" style={{ color: c.color }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-4">
                <Wallet size={16} style={{ color: "#22c55e" }} />
                <span className="font-semibold text-sm">Структура оплат</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Наличными (касса)", value: summary.cashOnHand || 0, color: "#22c55e", pct: 85 },
                  { label: "Банковский перевод", value: summary.bankTransfers || 0, color: "#6366f1", pct: 15 },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: "#6b7280" }}>{row.label}</span>
                      <span className="font-semibold" style={{ color: row.color }}>{formatCurrency(row.value)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={16} style={{ color: "#ef4444" }} />
                <span className="font-semibold text-sm">Долги по срокам</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Текущие (до 30 дней)", value: summary.expectedDebts * 0.4 || 0, color: "#f59e0b" },
                  { label: "Просроченные (30–90 дней)", value: summary.overdueDebts * 0.5 || 0, color: "#ef4444" },
                  { label: "Критические (90+ дней)", value: summary.overdueDebts * 0.3 || 0, color: "#7f1d1d" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: row.color }} />
                      <span className="text-sm" style={{ color: "#6b7280" }}>{row.label}</span>
                    </div>
                    <span className="font-semibold text-sm" style={{ color: row.color }}>{formatCurrency(row.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b" style={{ borderColor: "#e5e7eb" }}>
              <h3 className="font-semibold text-sm">Последние платежи</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Заказ</th>
                  <th>Способ</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {data?.payments?.slice(0, 15).map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="text-sm text-gray-600">{new Date(p.paidAt).toLocaleDateString("ru-RU")}</td>
                    <td className="font-medium text-sm" style={{ color: "#1a3a2e" }}>{p.client?.name || "—"}</td>
                    <td className="text-sm text-gray-500">{p.order?.orderNumber || "—"}</td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "#f0faf4", color: "#16a34a" }}>
                        {p.method === "CASH" ? "Наличные" : p.method === "TRANSFER" ? "Перевод" : "Карта"}
                      </span>
                    </td>
                    <td className="font-bold text-sm" style={{ color: "#22c55e" }}>{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
