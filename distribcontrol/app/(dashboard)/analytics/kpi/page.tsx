"use client"

import { useState, useEffect, useCallback } from "react"
import { Target, Loader2, TrendingUp, Users, ShoppingCart, FileDown, Search } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useBranch } from "@/lib/branch-context"
import * as XLSX from "xlsx"

export default function KPIPage() {
  const { selectedBranch } = useBranch()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchKPI = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(selectedBranch && selectedBranch !== "Все филиалы" ? { branch: selectedBranch } : {}),
        ...(search ? { search } : {}),
      })
      const res = await fetch(`/api/analytics/kpi?${params}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [selectedBranch, search])

  useEffect(() => {
    const t = setTimeout(fetchKPI, 300)
    return () => clearTimeout(t)
  }, [fetchKPI])

  const handleDownload = () => {
    if (!data?.agents?.length) return

    const rows = data.agents.map((a: any) => ({
      "Агент": a.name,
      "Email": a.email,
      "Филиал": a.branch?.name || "—",
      "План визитов": a.kpi?.planVisits ?? 0,
      "Факт визитов": a.kpi?.actualVisits ?? 0,
      "План продаж (сум)": a.kpi?.planSales ?? 0,
      "Факт продаж (сум)": a.kpi?.actualSales ?? 0,
      "Выполнение (%)": a.kpiPercent,
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "KPI")

    ws["!cols"] = [
      { wch: 25 }, { wch: 30 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
    ]

    XLSX.writeFile(wb, `KPI_${selectedBranch.replace(/\s/g, "_")}_${new Date().toLocaleDateString("ru-RU").replace(/\./g, "_")}.xlsx`)
  }

  const avgKpi = data?.agents?.length
    ? Math.round(data.agents.reduce((s: number, a: any) => s + a.kpiPercent, 0) / data.agents.length)
    : 0

  const totalSales = data?.agents?.reduce((s: number, a: any) => s + (a.kpi?.actualSales || 0), 0) || 0

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Выполнение KPI</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            KPI агентов за текущий период
            {selectedBranch !== "Все филиалы" && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                {selectedBranch}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={!data?.agents?.length}
          className="btn-secondary"
        >
          <FileDown size={16} className="mr-2" />
          Скачать Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#f0faf4" }}>
            <Users size={22} style={{ color: "#22c55e" }} />
          </div>
          <div>
            <div className="text-sm" style={{ color: "#6b7280" }}>Агентов</div>
            <div className="text-2xl font-bold" style={{ color: "#1a3a2e" }}>{data?.agents?.length || 0}</div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#eff6ff" }}>
            <TrendingUp size={22} style={{ color: "#6366f1" }} />
          </div>
          <div>
            <div className="text-sm" style={{ color: "#6b7280" }}>Ср. выполнение</div>
            <div className="text-2xl font-bold" style={{ color: "#6366f1" }}>
              {data?.agents?.length ? avgKpi + "%" : "—"}
            </div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#fffbeb" }}>
            <ShoppingCart size={22} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <div className="text-sm" style={{ color: "#6b7280" }}>Общие продажи</div>
            <div className="text-2xl font-bold" style={{ color: "#f59e0b" }}>
              {formatCurrency(totalSales)}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              className="form-input pl-9"
              placeholder="Поиск агента..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="animate-spin" size={32} style={{ color: "#22c55e" }} />
          </div>
        ) : !data?.agents?.length ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
            <Target size={40} className="mb-3 text-gray-300" />
            <p>Агенты не найдены</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Агент</th>
                <th>Филиал</th>
                <th>План визитов</th>
                <th>Факт визитов</th>
                <th>План продаж</th>
                <th>Факт продаж</th>
                <th>Выполнение</th>
              </tr>
            </thead>
            <tbody>
              {data?.agents?.map((a: any) => {
                const pct = a.kpiPercent
                const color = pct >= 100 ? "#22c55e" : pct >= 80 ? "#f59e0b" : "#ef4444"
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "#1a3a2e" }}
                        >
                          {a.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: "#1a3a2e" }}>{a.name}</div>
                          <div className="text-xs text-gray-500">{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{a.branch?.name || "—"}</td>
                    <td className="text-sm text-gray-700">{a.kpi?.planVisits ?? 0}</td>
                    <td className="text-sm font-semibold" style={{ color: "#1a3a2e" }}>{a.kpi?.actualVisits ?? 0}</td>
                    <td className="text-sm text-gray-600">{formatCurrency(a.kpi?.planSales ?? 0)}</td>
                    <td className="text-sm font-semibold" style={{ color: "#22c55e" }}>{formatCurrency(a.kpi?.actualSales ?? 0)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full max-w-[80px] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, pct)}%`, background: color }}
                          />
                        </div>
                        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
