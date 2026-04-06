"use client"

import { useState, useEffect } from "react"
import { Package, Loader2, Search, AlertTriangle, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function ProductsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/warehouse?search=${search}`)
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(fetchProducts, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Все товары</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Полный каталог товаров и складские остатки</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Всего товаров", value: data?.summary?.totalProducts || 0, color: "#1a3a2e" },
          { label: "Категорий", value: data?.summary?.categoriesCount || 0, color: "#6366f1" },
          { label: "Мало на складе", value: data?.summary?.lowStockCount || 0, color: "#ef4444" },
          { label: "Стоимость склада", value: formatCurrency(data?.summary?.totalStockValue || 0), color: "#22c55e" },
        ].map(c => (
          <div key={c.label} className="kpi-card">
            <div className="text-sm mb-1" style={{ color: "#6b7280" }}>{c.label}</div>
            <div className="text-xl font-bold" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "#e5e7eb" }}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" className="form-input pl-9" placeholder="Поиск по товару, артикулу..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="animate-spin" size={32} style={{ color: "#22c55e" }} />
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <Package size={40} className="mb-3 text-gray-300" />
              <p className="text-gray-500">Товары не найдены</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Артикул</th>
                  <th>Категория</th>
                  <th>Бренд</th>
                  <th>Цена</th>
                  <th>На складе</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {data?.products?.map((p: any) => {
                  const totalQty = p.inventory?.reduce((s: number, inv: any) => s + inv.quantity, 0) || 0
                  const isLow = totalQty <= p.minStock
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f0faf4" }}>
                            <Package size={14} style={{ color: "#22c55e" }} />
                          </div>
                          <span className="font-medium text-sm" style={{ color: "#1a3a2e" }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="text-sm font-mono text-gray-500">{p.sku}</td>
                      <td className="text-sm text-gray-600">{p.category?.name || "—"}</td>
                      <td className="text-sm text-gray-600">{p.brand || "—"}</td>
                      <td className="font-semibold text-sm" style={{ color: "#1a3a2e" }}>{formatCurrency(p.price)} / {p.unit}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {isLow && <AlertTriangle size={13} style={{ color: "#ef4444" }} />}
                          <span className={`text-sm font-semibold ${isLow ? "text-red-600" : "text-gray-700"}`}>{Math.round(totalQty)} {p.unit}</span>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: p.status === "ACTIVE" ? "#f0faf4" : "#f9fafb", color: p.status === "ACTIVE" ? "#16a34a" : "#6b7280" }}>
                          {p.status === "ACTIVE" ? "Активен" : "Неактивен"}
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
