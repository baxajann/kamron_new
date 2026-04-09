"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Bell, BellOff, CheckCheck, Trash2, Filter,
  AlertCircle, Info, CheckCircle2, AlertTriangle,
  RefreshCw, X, Inbox
} from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS"
  isRead: boolean
  createdAt: string
}

const TYPE_CONFIG = {
  INFO: {
    icon: Info,
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    label: "Информация",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    label: "Предупреждение",
  },
  ERROR: {
    icon: AlertCircle,
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    label: "Ошибка",
  },
  SUCCESS: {
    icon: CheckCircle2,
    color: "#22c55e",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    label: "Успех",
  },
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return "только что"
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`
  return date.toLocaleDateString("ru-RU")
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const fetchNotifications = useCallback(async (f = filter) => {
    try {
      const res = await fetch(`/api/notifications?filter=${f}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filter])

  useEffect(() => {
    fetchNotifications(filter)
  }, [filter, fetchNotifications])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchNotifications(filter)
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) {
      console.error(e)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (e) {
      console.error(e)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" })
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (!notifications.find(n => n.id === id)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const deleteAll = async () => {
    if (!confirm("Barcha bildirishnomalarni o'chirishni xohlaysizmi?")) return
    try {
      await fetch("/api/notifications?all=true", { method: "DELETE" })
      setNotifications([])
      setUnreadCount(0)
    } catch (e) {
      console.error(e)
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSelected = async () => {
    for (const id of selected) {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" })
    }
    setNotifications(prev => prev.filter(n => !selected.has(n.id)))
    setSelected(new Set())
    fetchNotifications(filter)
  }

  // Summary counts
  const counts = {
    all: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    read: notifications.filter(n => n.isRead).length,
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto mt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
            Уведомления
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Центр управления уведомлениями системы
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e2e8f0")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f1f5f9")}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Обновить
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#dbeafe")}
              onMouseLeave={e => (e.currentTarget.style.background = "#eff6ff")}
            >
              <CheckCheck size={14} />
              Все прочитаны
            </button>
          )}

          {selected.size > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
            >
              <Trash2 size={14} />
              Удалить ({selected.size})
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={deleteAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "white", color: "#ef4444", border: "1px solid #fecaca" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
              onMouseLeave={e => (e.currentTarget.style.background = "white")}
            >
              <BellOff size={14} />
              Удалить все
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Всего", value: counts.all, color: "#6366f1", bg: "#eef2ff" },
          { label: "Непрочитанных", value: unreadCount, color: "#ef4444", bg: "#fef2f2" },
          { label: "Прочитанных", value: counts.read, color: "#22c55e", bg: "#f0fdf4" },
        ].map(stat => (
          <div
            key={stat.label}
            className="card p-4 flex flex-col items-center justify-center text-center"
          >
            <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs font-medium" style={{ color: "#9ca3af" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-xl" style={{ background: "#f1f5f9", width: "fit-content" }}>
        <Filter size={14} className="ml-2 shrink-0" style={{ color: "#9ca3af" }} />
        {(["all", "unread", "read"] as const).map(f => (
          <button
            key={f}
            onClick={() => {
              setFilter(f)
              setSelected(new Set())
            }}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: filter === f ? "white" : "transparent",
              color: filter === f ? "#1a1d2e" : "#9ca3af",
              boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {f === "all" ? "Все" : f === "unread" ? "Непрочитанные" : "Прочитанные"}
            <span
              className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
              style={{
                background: filter === f ? "#f1f5f9" : "transparent",
                color: filter === f ? "#6b7280" : "#c4c9d4",
              }}
            >
              {f === "all" ? counts.all : f === "unread" ? counts.unread : counts.read}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "#9ca3af" }}>
            <RefreshCw size={28} className="animate-spin mb-3" />
            <span className="text-sm">Загрузка уведомлений...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "#9ca3af" }}>
            <Inbox size={40} className="mb-3 opacity-40" />
            <span className="text-sm font-medium">Нет уведомлений</span>
            <span className="text-xs mt-1">Здесь будут отображаться системные уведомления</span>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "#f1f5f9" }}>
            {notifications.map(notif => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.INFO
              const Icon = cfg.icon
              const isSelected = selected.has(notif.id)

              return (
                <li
                  key={notif.id}
                  className="flex items-start gap-3 px-5 py-4 transition-colors group cursor-pointer"
                  style={{
                    background: isSelected
                      ? "#eff6ff"
                      : notif.isRead
                      ? "white"
                      : "#fafffe",
                    borderLeft: notif.isRead ? "3px solid transparent" : `3px solid #22c55e`,
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = "#f8fafc"
                  }}
                  onMouseLeave={e => {
                    if (!isSelected)
                      e.currentTarget.style.background = notif.isRead ? "white" : "#fafffe"
                  }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(notif.id)}
                    onClick={e => e.stopPropagation()}
                    className="mt-1 shrink-0 accent-green-500 w-4 h-4 cursor-pointer"
                  />

                  {/* Type icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    <Icon size={18} style={{ color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0" onClick={() => !notif.isRead && markAsRead(notif.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "#1a1d2e" }}
                      >
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "#dcfce7", color: "#16a34a" }}
                        >
                          Новое
                        </span>
                      )}
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5 line-clamp-2" style={{ color: "#4b5563" }}>
                      {notif.message}
                    </p>
                    <span className="text-xs mt-1 block" style={{ color: "#9ca3af" }}>
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.isRead && (
                      <button
                        onClick={e => { e.stopPropagation(); markAsRead(notif.id) }}
                        title="Отметить прочитанным"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: "#3b82f6" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotification(notif.id) }}
                      title="Удалить"
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: "#ef4444" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer info */}
      {notifications.length > 0 && (
        <p className="text-center text-xs mt-4" style={{ color: "#9ca3af" }}>
          Показано {notifications.length} уведомлений
        </p>
      )}
    </div>
  )
}
