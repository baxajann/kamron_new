"use client"

import { useState, useEffect } from "react"
import { RotateCcw, Loader2, Search, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function ReturnsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchReturns = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/sales/returns?search=${search}`)
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(fetchReturns, 300)
    return () => clearTimeout(t)
  }, [search])

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: "На рассмотрении", color: "#f59e0b", icon: Clock },
    APPROVED: { label: "Одобрено", color: "#22c55e", icon: CheckCircle },
    REJECTED: { label: "Отклонено", color: "#ef4444", icon: AlertTriangle },
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Возвраты</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Управление возвратами товаров от клиентов</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Всего возвратов", value: data?.total || 0, color: "#6366f1" },
          { label: "Одобрено", value: data?.returns?.filter((r: any) => r.status === "APPROVED").length || 0, color: "#22c55e" },
          { label: "На рассмотрении", value: data?.returns?.filter((r: any) => r.status === "PENDING").length || 0, color: "#f59e0b" },
        ].map(c => (
          <div key={c.label} className="kpi-card">
            <div className="text-sm mb-1" style={{ color: "#6b7280" }}>{c.label}</div>
            <div className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "#e5e7eb" }}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" className="form-input pl-9" placeholder="Поиск по заказу, клиенту..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="animate-spin" size={32} style={{ color: "#22c55e" }} />
            </div>
          ) : data?.returns?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <RotateCcw size={40} className="mb-3 text-gray-300" />
              <p className="text-gray-500">Возвраты не найдены</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Заказ</th>
                  <th>Клиент</th>
                  <th>Агент</th>
                  <th>Причина</th>
                  <th>Сумма возврата</th>
                  <th>Дата</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {data?.returns?.map((ret: any) => {
                  const sc = statusConfig[ret.status] || statusConfig.PENDING
                  const StatusIcon = sc.icon
                  return (
                    <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                      <td className="font-medium text-sm" style={{ color: "#1a3a2e" }}>{ret.order?.orderNumber || "—"}</td>
                      <td className="text-sm text-gray-700">{ret.order?.client?.name || "—"}</td>
                      <td className="text-sm text-gray-600">{ret.order?.agent?.name?.split(" ")[0] || "—"}</td>
                      <td className="text-sm text-gray-600 max-w-xs truncate">{ret.reason || "—"}</td>
                      <td className="font-semibold" style={{ color: "#ef4444" }}>{formatCurrency(ret.amount)}</td>
                      <td className="text-sm text-gray-600">
                        {new Date(ret.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: sc.color + "18", color: sc.color }}>
                          <StatusIcon size={11} />
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
