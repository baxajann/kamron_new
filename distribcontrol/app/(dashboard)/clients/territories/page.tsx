"use client"

import { useState, useEffect } from "react"
import { MapPin, Loader2, Search, Users } from "lucide-react"

export default function TerritoriesPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchTerritories = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/clients/territories?search=${search}`)
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(fetchTerritories, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Территории</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Управление территориями и охватом клиентов</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Всего территорий</div>
          <div className="text-2xl font-bold" style={{ color: "#1a3a2e" }}>{data?.total || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Регионов</div>
          <div className="text-2xl font-bold" style={{ color: "#22c55e" }}>
            {data?.territories ? new Set(data.territories.map((t: any) => t.region).filter(Boolean)).size : 0}
          </div>
        </div>
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Клиентов охвачено</div>
          <div className="text-2xl font-bold" style={{ color: "#6366f1" }}>
            {data?.territories?.reduce((sum: number, t: any) => sum + (t._count?.clients || 0), 0) || 0}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b flex items-center" style={{ borderColor: "#e5e7eb" }}>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" className="form-input pl-9" placeholder="Поиск по территории..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="animate-spin" size={32} style={{ color: "#22c55e" }} />
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Территория</th>
                  <th>Регион</th>
                  <th>Клиентов</th>
                  <th>Маршрутов</th>
                  <th>Создана</th>
                </tr>
              </thead>
              <tbody>
                {data?.territories?.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f0faf4" }}>
                          <MapPin size={14} style={{ color: "#22c55e" }} />
                        </div>
                        <span className="font-medium text-sm" style={{ color: "#1a3a2e" }}>{t.name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{t.region || "—"}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">{t._count?.clients || 0}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{t._count?.routes || 0}</td>
                    <td className="text-sm text-gray-500">{new Date(t.createdAt).toLocaleDateString("ru-RU")}</td>
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
