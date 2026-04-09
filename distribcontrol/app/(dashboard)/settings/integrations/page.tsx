"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, Settings, CheckCircle2, XCircle,
  Copy, RefreshCw, Eye, EyeOff, ExternalLink, Plug
} from "lucide-react"

interface Integration {
  id: string
  name: string
  logo: string
  desc: string
  status: "connected" | "disconnected" | "error"
  lastSync?: string
  category: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: "1c",
    name: "1C:Бухгалтерия",
    logo: "1С",
    desc: "Синхронизация заказов, остатков и финансов с 1С",
    status: "connected",
    lastSync: new Date(Date.now() - 3600000).toISOString(),
    category: "ERP",
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    logo: "TG",
    desc: "Уведомления агентам и менеджерам через Telegram",
    status: "connected",
    lastSync: new Date(Date.now() - 1800000).toISOString(),
    category: "Мессенджеры",
  },
  {
    id: "excel",
    name: "Excel / Google Sheets",
    logo: "XL",
    desc: "Выгрузка отчётов в Excel и синхронизация с Google Sheets",
    status: "disconnected",
    category: "Отчётность",
  },
  {
    id: "sms",
    name: "SMS Gateway (Eskiz)",
    logo: "SMS",
    desc: "Отправка SMS уведомлений клиентам через Eskiz.uz",
    status: "error",
    category: "Уведомления",
  },
  {
    id: "maps",
    name: "Яндекс.Карты",
    logo: "ЯК",
    desc: "Геолокация визитов агентов и маршрутизация",
    status: "connected",
    lastSync: new Date().toISOString(),
    category: "Карты",
  },
  {
    id: "payme",
    name: "Payme / Click",
    logo: "PAY",
    desc: "Онлайн-оплата заказов через платёжные системы",
    status: "disconnected",
    category: "Платежи",
  },
]

const apiKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "";

function StatusBadge({ status }: { status: Integration["status"] }) {
  const cfg = {
    connected: { label: "Подключено", color: "#22c55e", bg: "#dcfce7" },
    disconnected: { label: "Откл.", color: "#9ca3af", bg: "#f3f4f6" },
    error: { label: "Ошибка", color: "#ef4444", bg: "#fef2f2" },
  }[status]
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return "только что"
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  return `${Math.floor(diff / 3600)} ч назад`
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")

  const toggleStatus = (id: string) => {
    setIntegrations(prev => prev.map(i =>
      i.id === id
        ? { ...i, status: i.status === "connected" ? "disconnected" : "connected" }
        : i
    ))
  }

  const sync = async (id: string) => {
    setSyncing(id)
    await new Promise(r => setTimeout(r, 1500))
    setIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, lastSync: new Date().toISOString(), status: "connected" } : i
    ))
    setSyncing(null)
  }

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categories = ["all", ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))]
  const filtered = filter === "all" ? integrations : integrations.filter(i => i.category === filter)

  return (
    <div className="animate-fade-in max-w-4xl mx-auto mt-4">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors" style={{ color: "#6b7280" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#22c55e")}
        onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
      >
        <ArrowLeft size={15} /> Назад к настройкам
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
          <Settings size={22} style={{ color: "#6b7280" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Интеграции</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>Внешние подключения к сервисам и API</p>
        </div>
      </div>

      {/* API Key */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Plug size={15} style={{ color: "#6366f1" }} />
          <h3 className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>API-ключ системы</h3>
        </div>
        <p className="text-xs mb-3" style={{ color: "#6b7280" }}>
          Используйте этот ключ для подключения внешних систем к DistribControl API.
        </p>
        <div className="flex items-center gap-2">
          <code
            className="flex-1 px-3 py-2 rounded-lg text-xs font-mono"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#1a1d2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {showKey ? apiKey : "sk_live_" + "•".repeat(28)}
          </code>
          <button
            onClick={() => setShowKey(!showKey)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0"
            style={{ background: "#f1f5f9", color: "#6b7280" }}
          >
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button
            onClick={copyKey}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0"
            style={{ background: copied ? "#dcfce7" : "#f1f5f9", color: copied ? "#22c55e" : "#6b7280" }}
          >
            <Copy size={15} />
          </button>
        </div>
        {copied && <p className="text-xs mt-2" style={{ color: "#22c55e" }}>✓ Скопировано в буфер</p>}
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: filter === cat ? "#1a1d2e" : "#f1f5f9",
              color: filter === cat ? "white" : "#6b7280",
            }}
          >
            {cat === "all" ? "Все" : cat}
          </button>
        ))}
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(integ => (
          <div key={integ.id} className="card p-5">
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "#1a1d2e", color: "#22c55e", letterSpacing: "-0.5px" }}
              >
                {integ.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>{integ.name}</span>
                  <StatusBadge status={integ.status} />
                </div>
                <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{integ.desc}</p>
              </div>
            </div>

            {integ.lastSync && (
              <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>
                Синхронизировано: {timeAgo(integ.lastSync)}
              </p>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleStatus(integ.id)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: integ.status === "connected" ? "#fef2f2" : "#f0fdf4",
                  color: integ.status === "connected" ? "#ef4444" : "#22c55e",
                  border: `1px solid ${integ.status === "connected" ? "#fecaca" : "#bbf7d0"}`,
                }}
              >
                {integ.status === "connected" ? "Отключить" : "Подключить"}
              </button>
              {integ.status === "connected" && (
                <button
                  onClick={() => sync(integ.id)}
                  disabled={syncing === integ.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
                  style={{ background: "#eff6ff", color: "#3b82f6" }}
                  title="Синхронизировать"
                >
                  <RefreshCw size={13} className={syncing === integ.id ? "animate-spin" : ""} />
                </button>
              )}
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
                style={{ background: "#f1f5f9", color: "#6b7280" }}
                title="Документация"
              >
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
