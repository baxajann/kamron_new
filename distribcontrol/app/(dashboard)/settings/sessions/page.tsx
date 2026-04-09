"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft, Laptop, Monitor, Smartphone, Tablet,
  MapPin, Clock, Shield, RefreshCw, LogOut, Wifi
} from "lucide-react"

interface Session {
  id: string
  device: string
  deviceType: "desktop" | "mobile" | "tablet"
  os: string
  browser: string
  ip: string
  location: string
  lastActive: string
  isCurrent: boolean
}

const DEMO_SESSIONS: Session[] = [
  {
    id: "1",
    device: "Windows 11 — Chrome 124",
    deviceType: "desktop",
    os: "Windows 11",
    browser: "Chrome 124",
    ip: "192.168.1.45",
    location: "Ташкент, UZ",
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: "2",
    device: "iPhone 14 Pro — Safari",
    deviceType: "mobile",
    os: "iOS 17",
    browser: "Safari 17",
    ip: "10.0.0.122",
    location: "Ташкент, UZ",
    lastActive: new Date(Date.now() - 3600000 * 2).toISOString(),
    isCurrent: false,
  },
  {
    id: "3",
    device: "MacBook Air — Firefox",
    deviceType: "desktop",
    os: "macOS Sonoma",
    browser: "Firefox 125",
    ip: "172.16.5.88",
    location: "Самарканд, UZ",
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    isCurrent: false,
  },
  {
    id: "4",
    device: "Android Tablet — Chrome",
    deviceType: "tablet",
    os: "Android 14",
    browser: "Chrome 123",
    ip: "10.10.0.77",
    location: "Бухара, UZ",
    lastActive: new Date(Date.now() - 86400000 * 3).toISOString(),
    isCurrent: false,
  },
]

function DeviceIcon({ type }: { type: string }) {
  const props = { size: 20, style: { color: "#6b7280" } }
  if (type === "mobile") return <Smartphone {...props} />
  if (type === "tablet") return <Tablet {...props} />
  return <Monitor {...props} />
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return "только что"
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  return `${Math.floor(diff / 86400)} дн назад`
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(DEMO_SESSIONS)
  const [loading, setLoading] = useState(false)

  const terminateSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const terminateAll = () => {
    setSessions(prev => prev.filter(s => s.isCurrent))
  }

  const refresh = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSessions(DEMO_SESSIONS)
    setLoading(false)
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto mt-4">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors" style={{ color: "#6b7280" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#22c55e")}
        onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
      >
        <ArrowLeft size={15} /> Назад к настройкам
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <Laptop size={22} style={{ color: "#3b82f6" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Устройства и сессии</h1>
            <p className="text-sm" style={{ color: "#6b7280" }}>Активные входы — {sessions.length} устройств</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
            style={{ background: "#f1f5f9", color: "#6b7280", border: "1px solid #e2e8f0" }}>
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Обновить
          </button>
          {sessions.filter(s => !s.isCurrent).length > 0 && (
            <button onClick={terminateAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
              <LogOut size={13} />
              Завершить все
            </button>
          )}
        </div>
      </div>

      {/* Security tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
        <Shield size={18} style={{ color: "#f59e0b", marginTop: 1, flexShrink: 0 }} />
        <p className="text-sm" style={{ color: "#92400e" }}>
          Если вы видите незнакомое устройство — немедленно завершите сессию и смените пароль.
        </p>
      </div>

      <div className="space-y-3">
        {sessions.map(session => (
          <div
            key={session.id}
            className="card p-4"
            style={{ borderLeft: session.isCurrent ? "3px solid #22c55e" : "3px solid transparent" }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: session.isCurrent ? "#f0fdf4" : "#f8fafc" }}>
                <DeviceIcon type={session.deviceType} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>{session.device}</span>
                  {session.isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1" style={{ background: "#dcfce7", color: "#16a34a" }}>
                      <Wifi size={10} /> Текущая сессия
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#6b7280" }}>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {session.location} · {session.ip}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {timeAgo(session.lastActive)}
                  </span>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => terminateSession(session.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors"
                  style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#fef2f2")}
                >
                  <LogOut size={12} />
                  Завершить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
