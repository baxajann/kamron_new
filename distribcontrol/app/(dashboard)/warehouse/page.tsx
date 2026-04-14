"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, FileDown, MoreHorizontal, PackageSearch, PackageCheck, AlertCircle, RefreshCw, BarChart, Settings, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import Link from "next/link"
import * as XLSX from "xlsx"

export default function WarehousePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  const [showAddCargo, setShowAddCargo] = useState(false)
  const [cargoProductId, setCargoProductId] = useState("")
  const [cargoQuantity, setCargoQuantity] = useState("")
  const [submitting, setSubmitting] = useState(false)

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

  const handleStatusChange = async (productId: string, newStatus: string) => {
    setUpdatingId(productId)
    setOpenMenuId(null)
    
    try {
      const res = await fetch(`/api/warehouse/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          products: prev.products.map((p: any) => 
            p.id === productId ? { ...p, status: newStatus } : p
          )
        }))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  const handleExport = () => {
    if (!data?.products?.length) return
    const rows = data.products.map((p: any) => {
      const stockQty = p.inventory?.reduce((s: number, inv: any) => s + inv.quantity, 0) || 0;
      return {
        "Артикул": p.sku,
        "Наименование": p.name,
        "Бренд": p.brand || "-",
        "Категория": p.category?.name || "Без категории",
        "Цена (сум)": p.price,
        "Остаток": stockQty,
        "Сумма (сум)": p.price * stockQty,
        "Статус": p.status === "ACTIVE" ? "Активен" : "Неактивен"
      };
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Остатки")
    XLSX.writeFile(wb, `Склад_${new Date().toLocaleDateString("ru-RU")}.xlsx`)
  }

  const handleAddCargo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cargoProductId || !cargoQuantity) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/warehouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: cargoProductId, quantity: Number(cargoQuantity) })
      })
      if (res.ok) {
        setShowAddCargo(false)
        setCargoProductId("")
        setCargoQuantity("")
        setSearch(search + " ") // trigger refetch
        setTimeout(() => setSearch(search), 100)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Склад и остатки</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Управление товарными запасами</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setSearch(search + " "); setTimeout(() => setSearch(search), 100) }} className="btn-secondary px-3">
            <RefreshCw size={16} className="mr-2" /> Синхронизация
          </button>
          <button onClick={handleExport} className="btn-secondary px-3" disabled={!data?.products?.length}>
            <FileDown size={16} className="mr-2" /> Отчет
          </button>
          <button onClick={() => setShowAddCargo(true)} className="btn-primary">
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
                  <th className="text-left w-32">Артикул</th>
                  <th className="text-left min-w-[200px]">Наименование / Бренд</th>
                  <th className="text-left w-36">Категория</th>
                  <th className="text-right w-32">Цена (сум)</th>
                  <th className="text-right w-36">Остаток</th>
                  <th className="text-right w-40">Сумма (сум)</th>
                  <th className="text-right w-16"></th>
                </tr>
              </thead>
              <tbody>
                {data?.products?.map((p: any, idx: number) => {
                  const stockQty = p.inventory?.reduce((s: number, inv: any) => s + inv.quantity, 0) || 0
                  return (
                  <tr key={p.id}>
                    <td className="text-xs font-mono text-gray-500 whitespace-nowrap">{p.sku}</td>
                    <td>
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                        {p.brand && <span>{p.brand}</span>}
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            background: p.status === "ACTIVE" ? "#f0fdf4" : p.status === "INACTIVE" ? "#fef2f2" : "#f1f5f9",
                            color: p.status === "ACTIVE" ? "#16a34a" : p.status === "INACTIVE" ? "#dc2626" : "#64748b"
                          }}>
                          {p.status === 'ACTIVE' ? 'Активен' : 'Неактивен'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 break-words">
                        {p.category?.name || "Без категории"}
                      </span>
                    </td>
                    <td className="text-right font-medium text-gray-900 whitespace-nowrap">{formatCurrency(p.price)}</td>
                    <td className="text-right">
                      <div className={`inline-flex font-bold text-sm px-2 py-0.5 rounded-md ${
                        stockQty === 0 ? "bg-red-50 text-red-600" :
                        stockQty <= 20 ? "bg-yellow-50 text-yellow-600" :
                        "text-green-600 bg-transparent"
                      }`}>
                        {formatNumber(stockQty)} <span className="text-xs font-normal ml-1 text-gray-500">{p.measurement || p.unit || 'шт'}</span>
                      </div>
                    </td>
                    <td className="text-right font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(p.price * stockQty)}
                    </td>
                    <td className="text-right relative">
                      <button 
                        onClick={() => toggleMenu(p.id)}
                        disabled={updatingId === p.id}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                      >
                        {updatingId === p.id ? <Loader2 size={18} className="animate-spin" /> : <MoreHorizontal size={18} />}
                      </button>

                      {openMenuId === p.id && (
                        <div 
                          className="absolute right-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                          style={idx >= Math.max(0, data.products.length - 2) && data.products.length >= 3 
                            ? { bottom: "calc(100% + 4px)" } 
                            : { top: "calc(100% + 4px)" }
                          }
                        >
                          <div className="p-1.5 focus:outline-none">
                            <button
                              onClick={() => handleStatusChange(p.id, p.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                            >
                              <RefreshCw size={15} className="text-blue-500" />
                              Сделать {p.status === "ACTIVE" ? "Неактивным" : "Активным"}
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                  )
                })}
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

      {showAddCargo && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAddCargo(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "#1a1d2e" }}>Приход товара</h3>
              <button onClick={() => setShowAddCargo(false)} className="text-gray-400 hover:text-gray-700">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddCargo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Товар</label>
                <select 
                  className="form-input w-full" 
                  value={cargoProductId} 
                  onChange={e => setCargoProductId(e.target.value)}
                  required
                >
                  <option value="">Выберите товар...</option>
                  {data?.products?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Количество для прихода</label>
                <input 
                  type="number" 
                  min="1" 
                  className="form-input w-full" 
                  placeholder="Введите количество" 
                  value={cargoQuantity}
                  onChange={e => setCargoQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddCargo(false)} className="btn-secondary flex-1 justify-center">Отмена</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : "Сохранить приход"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
