"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Download, RotateCcw, AlertTriangle, ChevronRight, X, Loader2, DollarSign, Calendar, ChevronLeft } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import Link from "next/link"

const PERIOD_DEFAULTS = { p1: 7, p2: 30, p3: 120 }

export default function DebtsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [currency, setCurrency] = useState<"UZS" | "USD" | "EUR">("UZS")
  const [showPeriodModal, setShowPeriodModal] = useState(false)
  const [periods, setPeriods] = useState(PERIOD_DEFAULTS)
  const [activeTab, setActiveTab] = useState<"CLIENTS" | "ORDERS">("ORDERS")

  const fetchDebts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/debts?page=${page}&search=${search}`)
      if (res.ok) {
        setData(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchDebts, 300)
    return () => clearTimeout(t)
  }, [page, search])

  const getCurrencyVal = (debt: any) => {
    if (currency === "USD") return formatCurrency(debt.amountUsd, "USD")
    if (currency === "EUR") return formatCurrency(debt.amountEur, "EUR")
    return formatCurrency(debt.amount, "UZS")
  }

  const getSummaryVal = (valUzs: number) => {
    if (currency === "USD") return formatCurrency(valUzs / 12500, "USD")
    if (currency === "EUR") return formatCurrency(valUzs / 13800, "EUR")
    return formatCurrency(valUzs, "UZS")
  }

  return (
    <div className="animate-fade-in">
      {/* Alert Strip */}
      <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 text-red-700 animate-slide-in">
        <AlertTriangle size={20} className="shrink-0" />
        <div className="flex-1 text-sm font-medium">Требуется перерасчет долгов клиентов. Последний перерасчет был 2 дня назад.</div>
        <button onClick={fetchDebts} className="btn-primary py-1.5 px-3 text-xs shrink-0 self-center border-0 shadow-none bg-red-600 hover:bg-red-700">Пересчитать</button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1 text-gray-400">
            <span>Избранные</span> <ChevronRight size={12} /> <span className="text-blue-500">Долги с заказов</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Долги с заказов</h1>
          <p className="text-sm mt-1 text-gray-500">Во всей организации</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-xl border p-1 shadow-sm h-10">
            {(["UZS", "USD", "EUR"] as const).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currency === c ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {c === "UZS" ? "SUM" : c}
              </button>
            ))}
          </div>
          <button onClick={() => setShowPeriodModal(true)} className="btn-secondary h-10 px-3 border-gray-200 shadow-sm text-gray-700 bg-white">
            <Calendar size={16} className="mr-2" /> Настроить период
          </button>
          <button className="btn-secondary h-10 px-3 border-gray-200 shadow-sm text-gray-700 bg-white">
            <Download size={16} className="mr-2" /> Скачать
          </button>
        </div>
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: `До ${periods.p1} дней`, value: data?.buckets?.b1, color: "bg-blue-50 text-blue-700 border-blue-100" },
          { label: `С ${periods.p1} - до ${periods.p2}`, value: data?.buckets?.b2, color: "bg-green-50 text-green-700 border-green-100" },
          { label: `С ${periods.p2} - до ${periods.p3}`, value: data?.buckets?.b3, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
          { label: `Больше ${periods.p3} дней`, value: data?.buckets?.b4, color: "bg-red-50 text-red-700 border-red-200" },
          { label: "Общий долг", value: data?.summary?.total, color: "bg-gray-800 text-white border-gray-900 shadow-md" },
        ].map((b, i) => (
          <div key={i} className={`rounded-xl p-4 border transition-transform hover:-translate-y-0.5 ${b.color}`}>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${b.color.includes('white') ? 'text-gray-300' : 'opacity-75'}`}>{b.label}</div>
            {loading ? (
              <div className="w-20 h-6 bg-black/10 rounded animate-pulse" />
            ) : (
              <div className="font-bold text-lg break-words leading-tight">
                {b.value ? getSummaryVal(b.value) : getSummaryVal(0)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button 
            onClick={() => setActiveTab("CLIENTS")} 
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 relative ${activeTab === "CLIENTS" ? "text-blue-600 border-blue-600 bg-white" : "text-gray-500 border-transparent hover:text-gray-800 hover:bg-white"}`}
          >
            КЛИЕНТЫ
          </button>
          <button 
            onClick={() => setActiveTab("ORDERS")} 
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 relative ${activeTab === "ORDERS" ? "text-blue-600 border-blue-600 bg-white" : "text-gray-500 border-transparent hover:text-gray-800 hover:bg-white"}`}
          >
            ЗАКАЗЫ
            <span className="ml-2 bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs font-bold">{data?.total || 0}</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-white">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" className="form-input pl-9 border-gray-200 shadow-sm" placeholder="Поиск по клиенту, заказу..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <button className="btn-secondary px-3 shadow-sm border-gray-200">
            <Filter size={16} className="mr-2 text-gray-500" /> Фильтры
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
          ) : activeTab === "CLIENTS" ? (
             <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">Раздел группировки по клиентам (в разработке)</div>
          ) : (
            <table className="data-table">
              <thead className="bg-gray-50/80 tracking-wide uppercase">
                <tr>
                  <th className="font-semibold" style={{ fontSize: "11px" }}>№ Заказа</th>
                  <th className="font-semibold" style={{ fontSize: "11px" }}>Клиент</th>
                  <th className="font-semibold text-center" style={{ fontSize: "11px" }}>Прошло дней</th>
                  <th className="font-semibold text-right" style={{ fontSize: "11px" }}>Долг</th>
                  <th className="font-semibold text-right" style={{ fontSize: "11px" }}>Срок оплаты</th>
                  <th className="font-semibold" style={{ fontSize: "11px" }}>Агент</th>
                  <th className="font-semibold" style={{ fontSize: "11px" }}>Дата создания</th>
                </tr>
              </thead>
              <tbody>
                {data?.debts?.map((debt: any) => (
                  <tr key={debt.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="font-medium text-blue-600 text-sm">
                      <Link href={`/sales/orders/${debt.orderId}`} className="hover:underline">{debt.order?.orderNumber}</Link>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900 text-sm">{debt.client?.name}</div>
                      <div className="text-xs text-gray-500 max-w-[180px] truncate" title={debt.client?.address}>{debt.client?.address}</div>
                    </td>
                    <td className="text-center">
                      <div className={`inline-flex items-center justify-center min-w-[32px] h-6 px-2 rounded-md text-xs font-bold
                        ${debt.daysOverdue > periods.p3 ? 'bg-red-100 text-red-700' : 
                          debt.daysOverdue > periods.p2 ? 'bg-yellow-100 text-yellow-700' : 
                          debt.daysOverdue > periods.p1 ? 'bg-green-100 text-green-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {debt.daysOverdue}
                      </div>
                    </td>
                    <td className="text-right font-semibold text-gray-900 pr-4">
                      {getCurrencyVal(debt)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className={`text-sm ${debt.dueDate && new Date(debt.dueDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                        {debt.dueDate ? formatDateTime(debt.dueDate).split(',')[0] : '—'}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-gray-100 text-gray-600">
                          {debt.order?.agent?.name?.charAt(0) || "A"}
                        </div>
                        <span className="text-sm text-gray-600 truncate max-w-[100px]">{debt.order?.agent?.name?.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDateTime(debt.createdAt).split(',')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {data?.pages > 1 && activeTab === "ORDERS" && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-xl">
            <div className="text-xs text-gray-500 font-medium">Показано {data.debts.length} из {data.total} записей</div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30 transition-colors shadow-sm"><ChevronLeft size={16}/></button>
              <div className="px-3 py-1 text-sm font-semibold text-gray-700">{page} / {data.pages}</div>
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30 transition-colors shadow-sm"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>

      {showPeriodModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 tracking-tight">НАСТРОЙКА ПЕРИОДОВ</h3>
              <button onClick={() => setShowPeriodModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 border shadow-sm"><X size={16} /></button>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">Выберите диапазоны дней (периоды) для расчета просроченной дебиторской задолженности в виджетах. Значения применяются немедленно.</p>
              <div className="space-y-4">
                {[
                  { id: 'p1', label: 'Первый период (дней)', bg: 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500/20 focus:border-blue-500' },
                  { id: 'p2', label: 'Второй период (дней)', bg: 'bg-green-50 text-green-700 border-green-200 focus:ring-green-500/20 focus:border-green-500' },
                  { id: 'p3', label: 'Третий период (дней)', bg: 'bg-yellow-50 text-yellow-700 border-yellow-300 focus:ring-yellow-500/20 focus:border-yellow-500' }
                ].map(p => (
                  <div key={p.id}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">{p.label}</label>
                    <input 
                      type="number" 
                      className={`w-full px-3 py-2 border rounded-xl shadow-sm text-sm font-bold transition-all outline-none focus:ring-4 ${p.bg}`}
                      value={periods[p.id as keyof typeof periods]}
                      onChange={e => setPeriods({...periods, [p.id]: parseInt(e.target.value) || 0})}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowPeriodModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm bg-white">
                  Отмена
                </button>
                <button onClick={() => setShowPeriodModal(false)} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-md shadow-blue-500/20">
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
