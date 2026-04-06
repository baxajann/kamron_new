"use client"

import { useState, useEffect } from "react"
import { Map, Loader2, Users, Target } from "lucide-react"

export default function CoveragePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/clients/territories")
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Охват территорий</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Анализ охвата клиентов по территориям</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Территорий</div>
          <div className="text-2xl font-bold" style={{ color: "#1a3a2e" }}>{data?.total || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Всего клиентов</div>
          <div className="text-2xl font-bold" style={{ color: "#22c55e" }}>
            {data?.territories?.reduce((s: number, t: any) => s + (t._count?.clients || 0), 0) || 0}
          </div>
        </div>
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Маршрутов</div>
          <div className="text-2xl font-bold" style={{ color: "#6366f1" }}>
            {data?.territories?.reduce((s: number, t: any) => s + (t._count?.routes || 0), 0) || 0}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" size={32} style={{ color: "#22c55e" }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.territories?.map((t: any) => {
            const totalClients = data.territories.reduce((s: number, x: any) => s + (x._count?.clients || 0), 0)
            const pct = totalClients ? Math.round(((t._count?.clients || 0) / totalClients) * 100) : 0
            return (
              <div key={t.id} className="kpi-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f0faf4" }}>
                      <Map size={16} style={{ color: "#22c55e" }} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "#1a3a2e" }}>{t.name}</div>
                      <div className="text-xs text-gray-500">{t.region || "Регион не указан"}</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold" style={{ color: "#22c55e" }}>{pct}%</span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#22c55e" }} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Users size={13} className="text-gray-400" />
                    <span>{t._count?.clients || 0} клиентов</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Target size={13} className="text-gray-400" />
                    <span>{t._count?.routes || 0} маршрутов</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
