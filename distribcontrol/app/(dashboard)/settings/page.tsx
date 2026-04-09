"use client"

import Link from "next/link"
import { Building2, Settings, Users, ShieldAlert, Laptop, ShieldCheck, Bell, ChevronRight } from "lucide-react"

const CARDS = [
  {
    title: "Профиль компании",
    icon: Building2,
    desc: "Реквизиты, название, контакты",
    href: "/settings/company",
    color: "#22c55e",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    title: "Роли и Права",
    icon: ShieldCheck,
    desc: "Управление доступом сотрудников",
    href: "/settings/roles",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#c4b5fd",
  },
  {
    title: "Пользователи",
    icon: Users,
    desc: "Управление учетными записями",
    href: "/personnel",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    title: "Устройства и сессии",
    icon: Laptop,
    desc: "Активные входы агентов",
    href: "/settings/sessions",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    title: "Резервное копирование",
    icon: ShieldAlert,
    desc: "Архивация базы данных",
    href: "/settings/backup",
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  {
    title: "Интеграции (1C, API)",
    icon: Settings,
    desc: "Внешние подключения",
    href: "/settings/integrations",
    color: "#6b7280",
    bg: "#f3f4f6",
    border: "#e5e7eb",
  },
  {
    title: "Уведомления",
    icon: Bell,
    desc: "Настройка уведомлений системы",
    href: "/settings/notifications",
    color: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
  },
]

export default function SettingsPage() {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto mt-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Настройки системы</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Конфигурация параметров платформы DistribControl</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CARDS.map(card => (
          <Link
            key={card.title}
            href={card.href}
            className="card p-6 flex flex-col items-start transition-all group"
            style={{ textDecoration: "none" }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = card.border
              el.style.boxShadow = `0 4px 20px ${card.color}18`
              el.style.transform = "translateY(-2px)"
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = ""
              el.style.boxShadow = ""
              el.style.transform = ""
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: card.bg, border: `1px solid ${card.border}` }}
            >
              <card.icon size={22} style={{ color: card.color }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors" style={{ color: "#1a1d2e" }}>
                {card.title}
              </h3>
              <p className="text-sm" style={{ color: "#9ca3af" }}>{card.desc}</p>
            </div>
            <div className="flex items-center gap-1 mt-4 text-xs font-medium transition-colors" style={{ color: card.color }}>
              Открыть <ChevronRight size={13} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
