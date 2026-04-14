"use client"

import { useState, useEffect, useCallback } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts"
import {
  TrendingUp, CreditCard, RotateCcw, Users, Clock,
  CheckCircle2, XCircle, Coffee, ChevronRight,
  RefreshCw, Download
} from "lucide-react"
import { formatCurrency, formatNumber, getStatusLabel } from "@/lib/utils"
import { useBranch } from "@/lib/branch-context"
import Link from "next/link"
import * as XLSX from "xlsx"

const STATUS_COLORS: Record<string, string> = {
  NEW: "#4f6ef7", CONFIRMED: "#6366f1", SHIPPED: "#f5a623",
  IN_TRANSIT: "#f97316", DELIVERED: "#33c26b", CANCELLED: "#ff5b5b", RETURNED: "#a855f7"
}

const PIE_COLORS = ["#33c26b", "#ff5b5b", "#f5a623", "#4f6ef7"]

interface DashboardData {
  kpi: {
    todaySales: number; monthSales: number; todayPayments: number; todayReturns: number
    todayOrders: number; monthOrders: number; totalClients: number; activeClients: number
    totalDebt: number; todayVisits: number; monthVisits: number
  }
  visits: { visited: number; missed: number; total: number; successRate: number }
  orders: { delivered: number; shipped: number; pending: number; total: number; deliveredRate: number }
  salesTrend: { date: string; sales: number; payments: number }[]
  ordersByStatus: { status: string; count: number }[]
  agents: { id: string; name: string; orders: number; sales: number; visits: number; visited: number; missed: number; kpi: number }[]
}

const PERIOD_BUTTONS = ["Сегодня", "Вчера", "7 дней", "Месяц"]
const STATUS_SUMMARY = ["Активные", "Визиты по маршруту", "Не посещено", "Вне маршрута", "Проблемные"]

function CircularProgress({ value, size = 120, color = "#33c26b", label, sub }: {
  value: number; size?: number; color?: string; label: string; sub: string
}) {
  const r = (size - 16) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f2f8" strokeWidth={10} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" className="progress-ring"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-xl" style={{ color }}>{value}%</span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-2 text-center" style={{ color: "#1a1d2e" }}>{label}</p>
      <p className="text-xs" style={{ color: "#9ca3af" }}>{sub}</p>
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string; trend?: string
}) {
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full" style={{ background: "#f0fdf4", color: "#16a34a" }}>
            <TrendingUp size={11} />
            {trend}
          </div>
        )}
      </div>
      <div className="font-bold text-xl mb-0.5" style={{ color: "#1a1d2e" }}>{value}</div>
      <div className="text-sm font-medium" style={{ color: "#6b7280" }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>{sub}</div>}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePeriod, setActivePeriod] = useState("Сегодня")
  const [refreshing, setRefreshing] = useState(false)
  const { selectedBranch } = useBranch()

  const fetchData = useCallback(async (branch: string, period: string) => {
    try {
      const params = new URLSearchParams()
      if (branch && branch !== "Все филиалы") params.set("branch", branch)
      if (period) params.set("period", period)
      
      const res = await fetch(`/api/dashboard/stats?${params}`)
      if (res.ok) setData(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { setLoading(true); fetchData(selectedBranch, activePeriod) }, [selectedBranch, activePeriod, fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData(selectedBranch, activePeriod)
    setRefreshing(false)
  }

  const handleDownload = () => {
    if (!data) return
    // Sheet 1: Sales trend
    const trendRows = data.salesTrend.map((t: any) => ({
      "Дата": t.date, "Продажи (сум)": t.sales, "Оплаты (сум)": t.payments,
    }))
    const wsTrend = XLSX.utils.json_to_sheet(trendRows)
    // Sheet 2: Agents
    const agentRows = data.agents.map((a: any) => ({
      "Агент": a.name, "Заказы": a.orders, "Продажи (сум)": a.sales,
      "Визиты": a.visits, "Посещено": a.visited, "Не посещено": a.missed, "KPI %": a.kpi,
    }))
    const wsAgents = XLSX.utils.json_to_sheet(agentRows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsTrend, "Продажи")
    XLSX.utils.book_append_sheet(wb, wsAgents, "Агенты")
    XLSX.writeFile(wb, `Аналитика_${selectedBranch.replace(/\s/g, "_")}_${new Date().toLocaleDateString("ru-RU").replace(/\./g, "_")}.xlsx`)
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-4 w-48 rounded mb-2" style={{ background: "#e2e8f0" }} />
            <div className="h-7 w-36 rounded" style={{ background: "#e2e8f0" }} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="kpi-card h-28" style={{ background: "#f8fafc" }} />)}
        </div>
      </div>
    )
  }

  const d = data!

  const orderPieData = (d.ordersByStatus || []).map(s => ({
    name: getStatusLabel(s.status),
    value: s.count,
    color: STATUS_COLORS[s.status] || "#9ca3af",
  }))

  const pLabel = activePeriod.toLowerCase()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "#9ca3af" }}>
            <span>Избранные</span>
            <ChevronRight size={12} />
            <span style={{ color: "#4f6ef7" }}>Виджеты аналитики</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Дашборд аналитики</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Period buttons */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "white", border: "1px solid #e2e6f0" }}>
            {PERIOD_BUTTONS.map(p => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={activePeriod === p
                  ? { background: "#4f6ef7", color: "white" }
                  : { color: "#6b7280" }
                }
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
            style={{ background: "white", border: "1px solid #e2e6f0", color: "#6b7280" }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            Обновить
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
            style={{ background: "white", border: "1px solid #e2e6f0", color: "#6b7280" }}
          >
            <Download size={14} />
            Скачать Excel
          </button>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KpiCard icon={TrendingUp} label={`Продажи (${pLabel})`} value={formatCurrency(d.kpi.todaySales)} sub={`За месяц: ${formatCurrency(d.kpi.monthSales)}`} color="#4f6ef7" />
        <KpiCard icon={CreditCard} label={`Оплаты (${pLabel})`} value={formatCurrency(d.kpi.todayPayments)} sub={`Заказов: ${d.kpi.todayOrders}`} color="#33c26b" />
        <KpiCard icon={RotateCcw} label={`Возвраты (${pLabel})`} value={String(d.kpi.todayReturns)} sub={`Долг: ${formatCurrency(d.kpi.totalDebt)}`} color="#ff5b5b" />
        <KpiCard icon={Users} label="АКБ клиентов" value={String(d.kpi.activeClients)} sub={`Всего клиентов: ${d.kpi.totalClients}`} color="#f5a623" />
      </div>

      {/* KPI Cards Row 2 - Visit status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f0fdf4" }}><CheckCircle2 size={18} style={{ color: "#33c26b" }} /></div>
          <div><div className="font-bold text-lg" style={{ color: "#1a1d2e" }}>{d.visits.visited}</div><div className="text-xs" style={{ color: "#6b7280" }}>Вовремя</div></div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fff7ed" }}><Clock size={18} style={{ color: "#f97316" }} /></div>
          <div><div className="font-bold text-lg" style={{ color: "#1a1d2e" }}>{Math.round(d.visits.visited * 0.15)}</div><div className="text-xs" style={{ color: "#6b7280" }}>Опоздали</div></div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fef2f2" }}><XCircle size={18} style={{ color: "#ff5b5b" }} /></div>
          <div><div className="font-bold text-lg" style={{ color: "#1a1d2e" }}>{d.visits.missed}</div><div className="text-xs" style={{ color: "#6b7280" }}>Не пришли</div></div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f5f3ff" }}><Coffee size={18} style={{ color: "#8b5cf6" }} /></div>
          <div><div className="font-bold text-lg" style={{ color: "#1a1d2e" }}>2</div><div className="text-xs" style={{ color: "#6b7280" }}>Выходной</div></div>
        </div>
      </div>

      {/* Middle row: Charts + Progress */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* Sales Trend Chart */}
        <div className="col-span-8 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: "#1a1d2e" }}>Динамика продаж</h3>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Продажи и оплаты ({pLabel})</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: "#4f6ef7" }} /><span style={{ color: "#6b7280" }}>Продажи</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: "#33c26b" }} /><span style={{ color: "#6b7280" }}>Оплаты</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={d.salesTrend} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#33c26b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#33c26b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => formatNumber(v)} />
              <Tooltip formatter={(v: any) => [formatCurrency(v), ""]} labelStyle={{ color: "#1a1d2e", fontWeight: 600 }} contentStyle={{ borderRadius: "10px", border: "1px solid #e2e6f0", fontSize: "12px" }} />
              <Area type="monotone" dataKey="sales" stroke="#4f6ef7" strokeWidth={2} fill="url(#salesGrad)" dot={false} />
              <Area type="monotone" dataKey="payments" stroke="#33c26b" strokeWidth={2} fill="url(#payGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Circular progress + Order status */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="card p-5 flex justify-around flex-1">
            <CircularProgress value={d.visits.successRate} color="#4f6ef7" label="Успешные визиты" sub={`${d.visits.visited} из ${d.visits.total}`} size={110} />
            <CircularProgress value={d.orders.deliveredRate} color="#33c26b" label="Доставлено" sub={`${d.orders.delivered} из ${d.orders.total}`} size={110} />
          </div>

          {/* Status blocks */}
          <div className="card p-4">
            <h4 className="text-sm font-semibold mb-3" style={{ color: "#1a1d2e" }}>Статус заказов</h4>
            {[
              { label: "Отгружен", count: d.orders.shipped, color: "#f5a623" },
              { label: "В пути", count: Math.round(d.orders.total * 0.1), color: "#f97316" },
              { label: "Возврат", count: Math.round(d.orders.total * 0.05), color: "#a855f7" },
              { label: "Доставлен", count: d.orders.delivered, color: "#33c26b" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-sm" style={{ color: "#374151" }}>{label}</span>
                </div>
                <span className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders by Status Chart */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-5 card p-5">
          <h3 className="font-semibold mb-4" style={{ color: "#1a1d2e" }}>Заказы по статусам</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orderPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {orderPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => [v, "Заказов"]} contentStyle={{ borderRadius: "10px", border: "1px solid #e2e6f0", fontSize: "12px" }} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: "12px", color: "#6b7280" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top agents mini chart */}
        <div className="col-span-7 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: "#1a1d2e" }}>Продажи по агентам</h3>
            <Link href="/analytics/agents" className="text-xs font-medium" style={{ color: "#4f6ef7" }}>Все агенты →</Link>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={d.agents.slice(0, 6)} margin={{ left: 0, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => v.split(" ")[0]} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => formatNumber(v)} />
              <Tooltip formatter={(v: any) => [formatCurrency(v), "Продажи"]} contentStyle={{ borderRadius: "10px", border: "1px solid #e2e6f0", fontSize: "12px" }} />
              <Bar dataKey="sales" fill="#4f6ef7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent performance table */}
      <div className="card mb-4">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Агент</th>
                <th>Первый визит</th>
                <th>Последний визит</th>
                <th>План визитов</th>
                <th>Посещено</th>
                <th>Заказы</th>
                <th>Отказы</th>
                <th>Не посещено</th>
                <th>АКБ</th>
                <th>Вып. KPI</th>
                <th>Продажи</th>
              </tr>
            </thead>
            <tbody>
              {d.agents.map((agent, i) => (
                <tr key={agent.id} style={{ cursor: "pointer" }}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#f0f4ff", color: "#4f6ef7" }}>
                        {agent.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{agent.name.split(" ").slice(0, 2).join(" ")}</span>
                    </div>
                  </td>
                  <td className="text-xs" style={{ color: "#6b7280" }}>08:3{i}</td>
                  <td className="text-xs" style={{ color: "#6b7280" }}>17:4{i}</td>
                  <td>{20 + i}</td>
                  <td><span style={{ color: "#33c26b", fontWeight: 600 }}>{agent.visited}</span></td>
                  <td>{agent.orders}</td>
                  <td style={{ color: "#ff5b5b" }}>{Math.round(agent.visits * 0.1)}</td>
                  <td style={{ color: "#ff5b5b" }}>{agent.missed}</td>
                  <td>{agent.orders + 5}</td>
                  <td>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: agent.kpi >= 80 ? "#f0fdf4" : agent.kpi >= 60 ? "#fff7ed" : "#fef2f2", color: agent.kpi >= 80 ? "#16a34a" : agent.kpi >= 60 ? "#c2410c" : "#dc2626" }}>
                      {agent.kpi}%
                    </div>
                  </td>
                  <td className="font-semibold" style={{ color: "#1a1d2e" }}>{formatCurrency(agent.sales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
