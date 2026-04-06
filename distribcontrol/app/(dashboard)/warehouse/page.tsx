"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, FileDown, MoreHorizontal, PackageSearch, PackageCheck, AlertCircle, RefreshCw, BarChart, Settings, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import Link from "next/link"

export default function WarehousePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/warehouse?page=${page}&search=${search}`)
        if (res.ok) {
          setData(await res.json())
        }
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(fetchStock, 300)
    return () => clearTimeout(t)
  }, [page, search])

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Склад и остатки</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Управление товарными запасами</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary px-3">
            <RefreshCw size={16} className="mr-2" /> Синхронизация
          </button>
          <button className="btn-secondary px-3">
            <FileDown size={16} className="mr-2" /> Отчет
          </button>
          <button className="btn-primary">
            <Plus size={16} /> Приход товара
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card flex items-center gap-4 p-5 hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <PackageCheck size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Всего номенклатур</div>
            <div className="text-2xl font-bold text-gray-900 leading-none">{loading ? "-" : data?.summary?.totalProducts}</div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4 p-5 hover:border-green-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
            <BarChart size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Сумма остатков</div>
            <div className="text-xl font-bold text-gray-900 leading-none">{loading ? "-" : formatCurrency(data?.summary?.totalStockValue)}</div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4 p-5 hover:border-red-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Мало на складе (≤20)</div>
            <div className="text-2xl font-bold text-gray-900 leading-none">{loading ? "-" : data?.summary?.lowStockCount}</div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4 p-5 hover:border-purple-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Settings size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Категории</div>
            <div className="text-2xl font-bold text-gray-900 leading-none">{loading ? "-" : data?.summary?.categoriesCount}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-white rounded-t-xl">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" className="form-input pl-9" placeholder="Поиск по наименованию, артикулу..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div className="flex gap-2">
            <select className="form-input bg-gray-50 min-w-[150px]">
              <option value="">Все категории</option>
              <option value="drinks">Напитки</option>
              <option value="snacks">Снеки</option>
            </select>
            <button className="btn-secondary px-3">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex items-center justify-center h-[400px]"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
          ) : data?.products?.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
               <PackageSearch size={48} className="text-gray-300 mb-4" />
               <p>Товар не найден</p>
             </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Артикул</th>
                  <th>Наименование / Бренд</th>
                  <th>Категория</th>
                  <th className="text-right">Цена</th>
                  <th className="text-right">Остаток</th>
                  <th className="text-right">Сумма</th>
                  <th className="text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data?.products?.map((p: any) => (
                  <tr key={p.id}>
                    <td className="text-xs font-mono text-gray-500">{p.sku}</td>
                    <td>
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.brand}</div>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {p.category?.name || "Без категории"}
                      </span>
                    </td>
                    <td className="text-right font-medium text-gray-900">{formatCurrency(p.price)}</td>
                    <td className="text-right">
                      <div className={`inline-flex font-bold text-sm px-2 py-0.5 rounded-md ${
                        p.stockQty === 0 ? "bg-red-50 text-red-600" :
                        p.stockQty <= 20 ? "bg-yellow-50 text-yellow-600" :
                        "text-green-600"
                      }`}>
                        {formatNumber(p.stockQty)} <span className="text-xs font-normal ml-1 text-gray-500">{p.measurement}</span>
                      </div>
                    </td>
                    <td className="text-right font-semibold text-gray-900">
                      {formatCurrency(p.price * p.stockQty)}
                    </td>
                    <td className="text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"><MoreHorizontal size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {data?.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-xl">
             <div className="text-xs text-gray-500">Показано {data.products.length} из {data.total} записей</div>
             <div className="flex items-center gap-1">
               <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded border text-gray-500 disabled:opacity-50"><ChevronLeft size={16}/></button>
               <div className="px-3 py-1 text-sm">{page} / {data.pages}</div>
               <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="p-1.5 rounded border text-gray-500 disabled:opacity-50"><ChevronRight size={16}/></button>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
