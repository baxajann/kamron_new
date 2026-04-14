"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, Filter, Plus, FileDown, MoreHorizontal, ShoppingCart, Package, MapPin, Loader2, ChevronLeft, ChevronRight, X, Edit2, RefreshCw } from "lucide-react"
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/utils"
import { useBranch } from "@/lib/branch-context"
import Link from "next/link"
import * as XLSX from "xlsx"
import { useRouter } from "next/navigation"

const ORDER_STATUSES = [
  { value: "", label: "Все статусы" },
  { value: "NEW", label: "Новый" },
  { value: "CONFIRMED", label: "Подтверждён" },
  { value: "SHIPPED", label: "Отгружен" },
  { value: "IN_TRANSIT", label: "В пути" },
  { value: "DELIVERED", label: "Доставлен" },
  { value: "RETURNED", label: "Возврат" },
  { value: "CANCELLED", label: "Отменён" },
]

export default function OrdersPage() {
  const { selectedBranch } = useBranch()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [showStatusSubmenu, setShowStatusSubmenu] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
        setShowStatusSubmenu(false)
      }
    }
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openMenuId])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    setOpenMenuId(null)
    setShowStatusSubmenu(false)

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          orders: prev.orders.map((o: any) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          ),
        }))
      } else {
        console.error("Failed to update status")
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const handleExport = () => {
    if (!data?.orders?.length) return
    const rows = data.orders.map((o: any) => ({
      "№ Заказа": o.orderNumber,
      "Клиент": o.client?.name || "-",
      "Агент": o.agent?.name || "-",
      "Сумма": o.totalAmount,
      "Статус оплаты": getStatusLabel(o.paymentStatus),
      "Статус заказа": getStatusLabel(o.status),
      "Дата": new Date(o.createdAt).toLocaleDateString("ru-RU"),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Заказы")
    XLSX.writeFile(wb, `Заказы_${new Date().toLocaleDateString("ru-RU")}.xlsx`)
  }

  const toggleMenu = (orderId: string) => {
    if (openMenuId === orderId) {
      setOpenMenuId(null)
      setShowStatusSubmenu(false)
    } else {
      setOpenMenuId(orderId)
      setShowStatusSubmenu(false)
    }
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
            Экспорт Excel
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
            className="px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all border"
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
                className="px-4 py-2 rounded-xl text-sm whitespace-nowrap font-medium border transition-colors"
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
                {data?.orders?.map((order: any, idx: number) => (
                  <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="font-medium text-blue-900 text-sm">
                      {order.orderNumber}
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Package size={12} /> {order.items?.length || 0} позиций
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedClient(order.client)} 
                        className="text-left font-medium text-blue-700 hover:text-blue-800 text-sm hover:underline"
                      >
                        {order.client?.name}
                      </button>
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
                      <div
                        className="relative flex justify-end"
                        ref={openMenuId === order.id ? menuRef : undefined}
                      >
                        <button
                          onClick={() => toggleMenu(order.id)}
                          disabled={updatingId === order.id}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                          title="Действия"
                        >
                          {updatingId === order.id
                            ? <Loader2 size={18} className="animate-spin" />
                            : <MoreHorizontal size={18} />
                          }
                        </button>

                        {openMenuId === order.id && (
                          <div
                            className="absolute right-0 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                            style={idx >= Math.max(0, data.orders.length - 2) && data.orders.length >= 3 
                              ? { bottom: "calc(100% + 4px)" } 
                              : { top: "calc(100% + 4px)" }
                            }
                          >
                            {/* Edit button */}
                            <div className="p-1.5 border-b border-gray-100">
                              <button
                                onClick={() => {
                                  setOpenMenuId(null)
                                  router.push(`/sales/orders/${order.id}/edit`)
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium"
                              >
                                <Edit2 size={15} className="text-blue-500" />
                                Редактировать
                              </button>
                            </div>

                            {/* Change status section */}
                            <div className="p-1.5">
                              <button
                                onClick={() => setShowStatusSubmenu(v => !v)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <RefreshCw size={15} className="text-green-500" />
                                <span className="flex-1 text-left">Изменить статус</span>
                                <span className="text-gray-400 text-xs">{showStatusSubmenu ? "▲" : "▼"}</span>
                              </button>

                              {showStatusSubmenu && (
                                <div className="mt-1 space-y-0.5" style={{ maxHeight: "160px", overflowY: "auto" }}>
                                  {ORDER_STATUSES.slice(1).map(s => (
                                    <button
                                      key={s.value}
                                      onClick={() => handleStatusChange(order.id, s.value)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors"
                                      style={
                                        order.status === s.value
                                          ? { background: "#dcfce7", color: "#15803d", fontWeight: 600 }
                                          : { color: "#374151" }
                                      }
                                    >
                                      {order.status === s.value ? (
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0" />
                                      ) : (
                                        <span className="w-1.5 h-1.5 inline-block shrink-0" />
                                      )}
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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

      {/* Client Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedClient(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "#1a1d2e" }}>Информация о клиенте</h3>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Название / Имя</div>
                <div className="font-medium">{selectedClient.name}</div>
              </div>
              {selectedClient.contactPerson && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Контактное лицо</div>
                  <div className="font-medium">{selectedClient.contactPerson}</div>
                </div>
              )}
              {selectedClient.phone && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Телефон</div>
                  <div className="font-medium">{selectedClient.phone}</div>
                </div>
              )}
              {selectedClient.address && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Адрес</div>
                  <div className="font-medium text-sm">{selectedClient.address}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500 mb-1">Регион / Территория</div>
                <div className="font-medium text-sm">{selectedClient.region || "Не указан"}</div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                 <div>
                   <div className="text-xs text-gray-500 mb-1">Лимит долга</div>
                   <div className="font-bold text-green-600">{formatCurrency(selectedClient.debtLimit || 0)}</div>
                 </div>
                 <Link href={`/clients`} className="text-sm font-medium text-blue-600 hover:underline">
                    Перейти к клиентам →
                 </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
