"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Plus, FileDown, MoreHorizontal, ShoppingCart, Package, MapPin, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/utils"
import { useBranch } from "@/lib/branch-context"
import Link from "next/link"

const ORDER_STATUSES = [
  { value: "", label: "Все статусы" },
  { value: "NEW", label: "Новые" },
  { value: "CONFIRMED", label: "Подтверждённые" },
  { value: "SHIPPED", label: "Отгруженные" },
  { value: "IN_TRANSIT", label: "В пути" },
  { value: "DELIVERED", label: "Доставленные" },
  { value: "RETURNED", label: "Возвраты" },
  { value: "CANCELLED", label: "Отменённые" },
]

export default function OrdersPage() {
  const { selectedBranch } = useBranch()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        search,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(selectedBranch && selectedBranch !== "Все филиалы" ? { branch: selectedBranch } : {}),
      })
      const res = await fetch(`/api/orders?${params}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, selectedBranch])

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300)
    return () => clearTimeout(t)
  }, [fetchOrders])

  useEffect(() => { setPage(1) }, [search, statusFilter, selectedBranch])

  const handleExport = () => {
    if (!data?.orders?.length) return
    const rows = [["№ Заказа", "Клиент", "Агент", "Сумма", "Статус оплаты", "Статус заказа", "Дата"]]
    data.orders.forEach((o: any) => {
      rows.push([
        o.orderNumber,
        o.client?.name || "-",
        o.agent?.name || "-",
        String(o.totalAmount),
        getStatusLabel(o.paymentStatus),
        getStatusLabel(o.status),
        new Date(o.createdAt).toLocaleDateString("ru-RU"),
      ])
    })
    const csv = rows.map(r => r.join(";")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "orders.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Заказы</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Управление заказами и продажами
            {selectedBranch !== "Все филиалы" && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                {selectedBranch}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-secondary" disabled={!data?.orders?.length}>
            <FileDown size={16} />
            Экспорт CSV
          </button>
          <Link href="/sales/orders/new" className="btn-primary">
            <Plus size={16} />
            Создать заказ
          </Link>
        </div>
      </div>

      {/* Quick status filter pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {ORDER_STATUSES.slice(0, 5).map(s => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1) }}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
            style={statusFilter === s.value
              ? { background: "#1a3a2e", color: "white", borderColor: "#1a3a2e" }
              : { background: "white", color: "#6b7280", borderColor: "#e5e7eb" }
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between bg-white rounded-t-xl" style={{ borderColor: "#f1f5f9" }}>
          <div className="flex gap-4 w-full md:w-auto flex-1">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                className="form-input pl-9"
                placeholder="Поиск по № заказа, клиенту..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <select
              className="form-input md:w-48 bg-gray-50"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            >
              {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <button
            className="btn-secondary px-3 shrink-0"
            onClick={() => setShowFilters(v => !v)}
            style={showFilters ? { background: "#f0fdf4", borderColor: "#22c55e", color: "#16a34a" } : {}}
          >
            <Filter size={16} className="mr-2" />
            Доп. фильтры
          </button>
        </div>

        {showFilters && (
          <div className="px-4 py-3 border-b flex flex-wrap gap-3 items-center" style={{ borderColor: "#f1f5f9", background: "#f9fafb" }}>
            <span className="text-sm text-gray-500 font-medium">Все статусы:</span>
            {ORDER_STATUSES.slice(1).map(s => (
              <button
                key={s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1) }}
                className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors"
                style={statusFilter === s.value
                  ? { background: "#dcfce7", color: "#16a34a", borderColor: "#86efac" }
                  : { background: "white", color: "#6b7280", borderColor: "#e5e7eb" }
                }
              >
                {s.label}
              </button>
            ))}
            {statusFilter && (
              <button onClick={() => setStatusFilter("")} className="text-xs text-red-500 flex items-center gap-1">
                <X size={12} /> Сбросить
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : data?.orders?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingCart size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Заказы не найдены</h3>
              <p className="text-gray-500">По вашим критериям не найдено заказов.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>№ Заказа</th>
                  <th>Клиент / Территория</th>
                  <th>Агент</th>
                  <th>Сумма</th>
                  <th>Оплата</th>
                  <th>Дата создания</th>
                  <th>Статус</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {data?.orders?.map((order: any) => (
                  <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="font-medium text-blue-900 text-sm">
                      {order.orderNumber}
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Package size={12} /> {order.items?.length || 0} позиций
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900 text-sm">{order.client?.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {order.client?.region || "Не указан"}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                          {order.agent?.name?.charAt(0) || "A"}
                        </div>
                        <span className="text-sm text-gray-700">{order.agent?.name?.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className={`badge ${getStatusColor(order.paymentStatus)}`}>
                        {getStatusLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm text-gray-700">{formatDateTime(order.createdAt).split(",")[0]}</div>
                      <div className="text-xs text-gray-500">{formatDateTime(order.createdAt).split(",")[1]}</div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(order.status)} px-2.5 py-1`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {data?.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-xl">
            <div className="text-xs text-gray-500">Показано {data.orders.length} из {data.total} записей</div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded border text-gray-500 disabled:opacity-50"><ChevronLeft size={16} /></button>
              <div className="px-3 py-1 text-sm">{page} / {data.pages}</div>
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="p-1.5 rounded border text-gray-500 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
