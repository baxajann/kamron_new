"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ShieldCheck, Check, X } from "lucide-react"

const ROLES = [
  {
    key: "ADMIN",
    label: "Администратор",
    color: "#ef4444",
    bg: "#fef2f2",
    desc: "Полный доступ ко всем модулям системы",
  },
  {
    key: "MANAGER",
    label: "Менеджер",
    color: "#f59e0b",
    bg: "#fffbeb",
    desc: "Управление агентами, аналитика, KPI",
  },
  {
    key: "AGENT",
    label: "Торговый агент",
    color: "#3b82f6",
    bg: "#eff6ff",
    desc: "Продажи, заказы, маршруты, визиты",
  },
  {
    key: "WAREHOUSE",
    label: "Склад",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    desc: "Склад, остатки, поступления",
  },
  {
    key: "FINANCE",
    label: "Финансы",
    color: "#22c55e",
    bg: "#f0fdf4",
    desc: "Долги, платежи, финансовая аналитика",
  },
]

const MODULES = [
  "Продажи / Заказы",
  "Клиенты",
  "Склад",
  "Финансы / Долги",
  "Персонал",
  "Аналитика / KPI",
  "Маршруты",
  "Настройки системы",
]

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  ADMIN:     { "Продажи / Заказы": true, "Клиенты": true, "Склад": true, "Финансы / Долги": true, "Персонал": true, "Аналитика / KPI": true, "Маршруты": true, "Настройки системы": true },
  MANAGER:   { "Продажи / Заказы": true, "Клиенты": true, "Склад": false, "Финансы / Долги": true, "Персонал": true, "Аналитика / KPI": true, "Маршруты": true, "Настройки системы": false },
  AGENT:     { "Продажи / Заказы": true, "Клиенты": true, "Склад": false, "Финансы / Долги": false, "Персонал": false, "Аналитика / KPI": false, "Маршруты": true, "Настройки системы": false },
  WAREHOUSE: { "Продажи / Заказы": false, "Клиенты": false, "Склад": true, "Финансы / Долги": false, "Персонал": false, "Аналитика / KPI": false, "Маршруты": false, "Настройки системы": false },
  FINANCE:   { "Продажи / Заказы": false, "Клиенты": true, "Склад": false, "Финансы / Долги": true, "Персонал": false, "Аналитика / KPI": true, "Маршруты": false, "Настройки системы": false },
}

export default function RolesPage() {
  const [activeRole, setActiveRole] = useState("ADMIN")
  const [perms, setPerms] = useState(DEFAULT_PERMISSIONS)
  const [saved, setSaved] = useState(false)

  const toggle = (module: string) => {
    if (activeRole === "ADMIN") return // Admin always has all
    setPerms(p => ({
      ...p,
      [activeRole]: { ...p[activeRole], [module]: !p[activeRole][module] },
    }))
  }

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 600))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const currentRole = ROLES.find(r => r.key === activeRole)!

  return (
    <div className="animate-fade-in max-w-4xl mx-auto mt-4">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors" style={{ color: "#6b7280" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#22c55e")}
        onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
      >
        <ArrowLeft size={15} /> Назад к настройкам
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#f5f3ff", border: "1px solid #c4b5fd" }}>
          <ShieldCheck size={22} style={{ color: "#8b5cf6" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Роли и Права</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>Управление доступом сотрудников</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role list */}
        <div className="space-y-2">
          {ROLES.map(role => (
            <button
              key={role.key}
              onClick={() => setActiveRole(role.key)}
              className="w-full text-left p-4 rounded-xl border transition-all"
              style={{
                background: activeRole === role.key ? role.bg : "white",
                borderColor: activeRole === role.key ? role.color + "66" : "#e5e7eb",
                boxShadow: activeRole === role.key ? `0 0 0 2px ${role.color}22` : "none",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: role.color }} />
                <span className="font-semibold text-sm" style={{ color: activeRole === role.key ? role.color : "#1a1d2e" }}>
                  {role.label}
                </span>
              </div>
              <p className="text-xs mt-1 pl-4.5" style={{ color: "#9ca3af" }}>{role.desc}</p>
            </button>
          ))}
        </div>

        {/* Permissions grid */}
        <div className="md:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: currentRole.color }}>
              Доступ: {currentRole.label}
            </h3>
            {activeRole === "ADMIN" && (
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "#f3f4f6", color: "#6b7280" }}>
                Полный доступ
              </span>
            )}
          </div>

          <div className="space-y-2">
            {MODULES.map(module => {
              const hasAccess = perms[activeRole]?.[module] ?? false
              return (
                <div
                  key={module}
                  className="flex items-center justify-between p-3 rounded-xl transition-colors"
                  style={{ background: hasAccess ? currentRole.bg + "88" : "#f9fafb" }}
                >
                  <span className="text-sm font-medium" style={{ color: hasAccess ? "#1a1d2e" : "#9ca3af" }}>
                    {module}
                  </span>
                  <button
                    onClick={() => toggle(module)}
                    disabled={activeRole === "ADMIN"}
                    title={activeRole === "ADMIN" ? "Администратор всегда имеет полный доступ" : ""}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
                    style={{
                      background: hasAccess ? currentRole.color : "#e5e7eb",
                      cursor: activeRole === "ADMIN" ? "not-allowed" : "pointer",
                    }}
                  >
                    {hasAccess
                      ? <Check size={14} color="white" strokeWidth={3} />
                      : <X size={14} color="#9ca3af" strokeWidth={3} />
                    }
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t">
            {saved && <span className="text-sm font-medium" style={{ color: "#22c55e" }}>✓ Права сохранены</span>}
            <button onClick={handleSave} className="btn-primary">
              <ShieldCheck size={15} />
              Сохранить права
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
