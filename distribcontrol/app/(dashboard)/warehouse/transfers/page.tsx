"use client"

import { useState, useEffect } from "react"
import { ArrowRightLeft, Loader2, Search, Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function TransfersPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/warehouse?search=${search}`)
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(fetchData, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Перемещения</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Перемещения товаров между складами и филиалами</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Позиций на складах</div>
          <div className="text-2xl font-bold" style={{ color: "#1a3a2e" }}>{data?.total || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Общая стоимость</div>
          <div className="text-2xl font-bold" style={{ color: "#22c55e" }}>{formatCurrency(data?.summary?.totalStockValue || 0)}</div>
        </div>
        <div className="kpi-card">
          <div className="text-sm mb-1" style={{ color: "#6b7280" }}>Требуют пополнения</div>
          <div className="text-2xl font-bold" style={{ color: "#f59e0b" }}>{data?.summary?.lowStockCount || 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b flex items-center" style={{ borderColor: "#e5e7eb" }}>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" className="form-input pl-9" placeholder="Поиск по товару..." value={search} onChange={e => setSearch(e.target.value)} />
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
                  <th>Товар</th>
                  <th>Артикул</th>
                  <th>Кол-во</th>
                  <th>Резерв</th>
                  <th>Склад</th>
                  <th>Цена</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {data?.products?.flatMap((p: any) =>
                  (p.inventory || []).map((inv: any, idx: number) => {
                    const isLow = inv.quantity <= p.minStock
                    return (
                      <tr key={`${p.id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f0faf4" }}>
                              <Package size={14} style={{ color: "#22c55e" }} />
                            </div>
                            <span className="font-medium text-sm" style={{ color: "#1a3a2e" }}>{p.name}</span>
                          </div>
                        </td>
                        <td className="text-sm font-mono text-gray-500">{p.sku}</td>
                        <td className={`text-sm font-bold ${isLow ? "text-red-600" : "text-gray-800"}`}>{Math.round(inv.quantity)} {p.unit}</td>
                        <td className="text-sm text-gray-500">{Math.round(inv.reservedQty)} {p.unit}</td>
                        <td className="text-sm text-gray-600">Главный склад</td>
                        <td className="text-sm text-gray-700">{formatCurrency(p.price)}</td>
                        <td>
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: isLow ? "#fef2f2" : "#f0faf4", color: isLow ? "#dc2626" : "#16a34a" }}>
                            {isLow ? "Мало" : "В норме"}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
