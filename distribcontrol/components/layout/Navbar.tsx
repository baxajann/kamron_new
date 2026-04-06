"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useBranch } from "@/lib/branch-context"
import {
  BarChart3, Users, ShoppingCart, User, Package, CircleDollarSign,
  Bell, Settings, ChevronDown, LogOut,
  Building2, FileText, AlertCircle, Route, UserCheck, X, Star
} from "lucide-react"

interface NavUser {
  name?: string | null
  email?: string | null
  role?: string
}

interface NavbarProps {
  user: NavUser
}

const MEGA_MENUS = {
  sales: {
    label: "Продажи",
    href: "/sales",
    icon: ShoppingCart,
    groups: [
      { title: "Заказы", items: [{ label: "Заказы", href: "/sales/orders" }, { label: "Возвраты", href: "/sales/returns" }] },
      { title: "Финансы", items: [{ label: "Долги", href: "/debts" }, { label: "История оплат", href: "/finance/payments" }] },
    ]
  },
  clients: {
    label: "Клиенты",
    href: "/clients",
    icon: Users,
    groups: [
      { title: "Контрагенты", items: [{ label: "Клиенты", href: "/clients" }, { label: "Маршруты", href: "/routes" }] },
      { title: "Территория", items: [{ label: "Территории", href: "/clients/territories" }, { label: "Охват", href: "/clients/coverage" }] },
    ]
  },
  warehouse: {
    label: "Склад",
    href: "/warehouse",
    icon: Package,
    groups: [
      { title: "Товары", items: [{ label: "Все товары", href: "/warehouse/products" }, { label: "Остатки", href: "/warehouse" }] },
      { title: "Движение", items: [{ label: "Поступления", href: "/warehouse/incoming" }, { label: "Перемещения", href: "/warehouse/transfers" }] },
    ]
  },
  analytics: {
    label: "Аналитика",
    href: "/analytics",
    icon: BarChart3,
    groups: [
      { title: "Отчёты", items: [{ label: "Продажи", href: "/analytics" }, { label: "Финансы", href: "/analytics/finance" }] },
      { title: "Контроль", items: [{ label: "KPI", href: "/analytics/kpi" }, { label: "Персонал", href: "/personnel" }] },
    ]
  },
}

const BRANCHES = ["Все филиалы", "Ташкент", "Бекобод", "Янгиюль", "Завод", "Хоразм"]
const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Администратор", MANAGER: "Менеджер", AGENT: "Торговый агент",
  WAREHOUSE: "Сотрудник склада", FINANCE: "Финансовый менеджер",
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showBranch, setShowBranch] = useState(false)
  const { selectedBranch, setSelectedBranch } = useBranch()
  const menuRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
        setShowProfile(false)
        setShowNotifications(false)
        setShowBranch(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleMenuEnter = (key: string) => {
    clearTimeout(closeTimer.current)
    setOpenMenu(key)
  }

  const handleMenuLeave = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180)
  }

  return (
    <>
      <nav className="navbar" ref={menuRef}>
        <div className="flex items-center h-full px-5 gap-1">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.25)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <BarChart3 size={15} color="#4ade80" />
            </div>
            <span className="text-white font-bold text-sm tracking-wide">DistribControl</span>
          </Link>

          {/* Separator */}
          <div className="w-px h-5 mr-4" style={{ background: "rgba(255,255,255,0.12)" }} />

          {/* Main nav — 4 items */}
          <div className="flex items-center gap-0.5 flex-1">
            {Object.entries(MEGA_MENUS).map(([key, menu]) => {
              const Icon = menu.icon
              const isActive = pathname.startsWith(menu.href) && menu.href !== "/"
              const isOpen = openMenu === key

              return (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => handleMenuEnter(key)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link
                    href={menu.href}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      color: isActive || isOpen ? "white" : "rgba(255,255,255,0.72)",
                      background: isActive || isOpen ? "rgba(34,197,94,0.18)" : "transparent",
                    }}
                  >
                    <Icon size={14} />
                    {menu.label}
                    <ChevronDown size={12} style={{ opacity: 0.6, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }} />
                  </Link>

                  {/* Mega dropdown */}
                  {isOpen && (
                    <div
                      className="mega-menu absolute top-[calc(100%+8px)] left-0 p-5 min-w-max"
                      style={{ zIndex: 200 }}
                      onMouseEnter={() => clearTimeout(closeTimer.current)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <div className="flex gap-7">
                        {menu.groups.map(group => (
                          <div key={group.title} style={{ minWidth: "160px" }}>
                            <p className="text-[11px] font-semibold mb-2.5" style={{ color: "#9ca3af" }}>{group.title}</p>
                            <ul className="space-y-0.5">
                              {group.items.map(item => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                                    style={{ color: "#374151" }}
                                    onClick={() => setOpenMenu(null)}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#e8f5e9")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {/* Branch switcher */}
            <div className="relative">
              <button
                onClick={() => { setShowBranch(!showBranch); setShowProfile(false); setShowNotifications(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <Building2 size={13} />
                {selectedBranch}
                <ChevronDown size={11} style={{ opacity: 0.7 }} />
              </button>
              {showBranch && (
                <div className="absolute right-0 top-[calc(100%+8px)] bg-white rounded-xl shadow-xl border py-2 w-44 animate-fade-in" style={{ zIndex: 200 }}>
                  <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "#9ca3af" }}>Филиал</p>
                  {BRANCHES.map(b => (
                    <button
                      key={b}
                      onClick={() => { setSelectedBranch(b); setShowBranch(false) }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{ color: b === selectedBranch ? "#22c55e" : "#374151", fontWeight: b === selectedBranch ? 600 : 400 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f0faf4")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); setShowBranch(false) }}
                className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.8)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-[calc(100%+8px)] bg-white rounded-xl shadow-xl border w-80 animate-fade-in" style={{ zIndex: 200 }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="font-semibold text-sm">Уведомления</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#fef2f2", color: "#dc2626" }}>5 новых</span>
                  </div>
                  {[
                    { title: "Новый заказ", msg: "ООО «Ташкент Маркет» оформил заказ", time: "2 мин" },
                    { title: "Просрочен долг", msg: "ИП Рашидов А. — долг более 120 дней", time: "1 ч" },
                    { title: "Низкий остаток", msg: "Coca-Cola 0.5л — заканчивается на складе", time: "3 ч" },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium text-sm mb-0.5">{n.title}</div>
                      <div className="text-xs" style={{ color: "#6b7280" }}>{n.msg}</div>
                      <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>{n.time} назад</div>
                    </div>
                  ))}
                  <div className="px-4 py-2 text-center">
                    <Link href="/settings/notifications" className="text-xs font-medium" style={{ color: "#22c55e" }} onClick={() => setShowNotifications(false)}>Все уведомления</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link
              href="/settings"
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.8)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Settings size={16} />
            </Link>

            {/* Profile */}
            <div className="relative ml-1">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowBranch(false) }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
                style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#22c55e", color: "white" }}>
                  {user.name?.charAt(0) || "A"}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-medium text-white leading-none">{user.name?.split(" ")[0]}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{ROLE_LABELS[user.role || ""] || user.role}</div>
                </div>
                <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.6)" }} />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-[calc(100%+8px)] bg-white rounded-xl shadow-xl border w-56 animate-fade-in" style={{ zIndex: 200 }}>
                  <div className="px-4 py-3 border-b">
                    <div className="font-semibold text-sm">{user.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{user.email}</div>
                    <div className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block font-medium" style={{ background: "#f0faf4", color: "#22c55e" }}>
                      {ROLE_LABELS[user.role || ""] || user.role}
                    </div>
                  </div>
                  {[
                    { label: "Профиль", href: "/settings/profile", icon: User },
                    { label: "Настройки", href: "/settings", icon: Settings },
                    { label: "Уведомления", href: "/settings/notifications", icon: Bell },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: "#374151" }}
                      onClick={() => setShowProfile(false)}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f0faf4")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <Icon size={15} style={{ color: "#9ca3af" }} />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t my-1" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors"
                    style={{ color: "#dc2626" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <LogOut size={15} />
                    Выйти из системы
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
