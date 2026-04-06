"use client"

import { useState, useEffect } from "react"
import { Route, Loader2, Search, MapPin, User, Calendar } from "lucide-react"

const DAY_LABELS: Record<string, string> = {
  MON: "Пн", TUE: "Вт", WED: "Ср", THU: "Чт", FRI: "Пт", SAT: "Сб", SUN: "Вс",
}

export default function RoutesPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/routes?search=${search}`)
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(fetchRoutes, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Маршруты</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Маршруты торговых агентов по территориям</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Всего маршрутов</div>
          <div className="text-2xl font-bold" style={{ color: "#1a3a2e" }}>{data?.total || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Активных агентов</div>
          <div className="text-2xl font-bold" style={{ color: "#22c55e" }}>
            {data?.routes ? new Set(data.routes.map((r: any) => r.agentId)).size : 0}
          </div>
        </div>
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Территорий</div>
          <div className="text-2xl font-bold" style={{ color: "#6366f1" }}>
            {data?.routes ? new Set(data.routes.filter((r: any) => r.territory).map((r: any) => r.territoryId)).size : 0}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "#e5e7eb" }}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" className="form-input pl-9" placeholder="Поиск по маршруту, агенту..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="animate-spin" size={32} style={{ color: "#22c55e" }} />
            </div>
          ) : data?.routes?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <Route size={40} className="mb-3 text-gray-300" />
              <p className="text-gray-500">Маршруты не найдены</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Маршрут</th>
                  <th>Агент</th>
                  <th>Территория</th>
                  <th>Филиал</th>
                  <th>День недели</th>
                  <th>Визитов</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {data?.routes?.map((route: any) => (
                  <tr key={route.id} className="hover:bg-gray-50 transition-colors">
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f0faf4" }}>
                          <Route size={14} style={{ color: "#22c55e" }} />
                        </div>
                        <span className="font-medium text-sm" style={{ color: "#1a3a2e" }}>{route.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                          {route.agent?.name?.charAt(0) || "?"}
                        </div>
                        <span className="text-sm text-gray-700">{route.agent?.name || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin size={13} className="text-gray-400" />
                        {route.territory?.name || "—"}
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{route.branch?.name || "—"}</td>
                    <td>
                      {route.dayOfWeek ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: "#f0faf4", color: "#16a34a" }}>
                          <Calendar size={11} />
                          {DAY_LABELS[route.dayOfWeek] || route.dayOfWeek}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="text-sm font-medium" style={{ color: "#6b7280" }}>{route._count?.visits || route.visits?.length || 0}</td>
                    <td>
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: route.status === "ACTIVE" ? "#f0faf4" : "#fef2f2", color: route.status === "ACTIVE" ? "#16a34a" : "#dc2626" }}>
                        {route.status === "ACTIVE" ? "Активен" : "Неактивен"}
                      </span>
                    </td>
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
