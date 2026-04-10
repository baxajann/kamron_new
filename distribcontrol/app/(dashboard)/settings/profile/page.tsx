"use client"

import { useState, useEffect } from "react"
import { User, Phone, Mail, Lock, Building2, Save, Loader2, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Администратор",
  MANAGER: "Менеджер",
  AGENT: "Торговый агент",
  WAREHOUSE: "Сотрудник склада",
  FINANCE: "Финансовый менеджер",
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#ef4444",
  MANAGER: "#6366f1",
  AGENT: "#22c55e",
  WAREHOUSE: "#f59e0b",
  FINANCE: "#0ea5e9",
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        setUser(data)
        setName(data.name || "")
        setPhone(data.phone || "")
      })
      .finally(() => setLoading(false))
  }, [])

  const showAlert = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg })
    setTimeout(() => setAlert(null), 4000)
  }

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data)
        showAlert("success", "Профиль успешно обновлён!")
      } else {
        showAlert("error", data.error || "Ошибка сохранения")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showAlert("error", "Пароли не совпадают")
      return
    }
    if (newPassword.length < 6) {
      showAlert("error", "Пароль должен быть не менее 6 символов")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        showAlert("success", "Пароль успешно изменён!")
      } else {
        showAlert("error", data.error || "Ошибка смены пароля")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={32} style={{ color: "#22c55e" }} />
      </div>
    )
  }

  const roleColor = ROLE_COLORS[user?.role] || "#6b7280"

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Мой профиль</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Управление личными данными и паролем</p>
      </div>

      {/* Alert */}
      {alert && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
          style={{
            background: alert.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: alert.type === "success" ? "#16a34a" : "#dc2626",
            border: `1px solid ${alert.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          }}
        >
          {alert.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {alert.msg}
        </div>
      )}

      {/* Avatar + Role card */}
      <div className="card p-6 flex items-center gap-5 mb-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
          style={{ background: roleColor }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg truncate" style={{ color: "#111827" }}>{user?.name}</div>
          <div className="text-sm truncate" style={{ color: "#6b7280" }}>{user?.email}</div>
          <div
            className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: roleColor + "18", color: roleColor }}
          >
            <ShieldCheck size={12} />
            {ROLE_LABELS[user?.role] || user?.role}
          </div>
        </div>
        {user?.branch && (
          <div className="shrink-0 text-right hidden sm:block">
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "#6b7280" }}>
              <Building2 size={15} />
              {user.branch.name}
            </div>
          </div>
        )}
      </div>

      {/* Edit Info */}
      <div className="card p-6 mb-5">
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: "#111827" }}>
          <User size={18} style={{ color: "#22c55e" }} />
          Личная информация
        </h2>
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Полное имя</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition"
                placeholder="Ваше имя"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Email нельзя изменить</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Телефон</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition"
                placeholder="+998 90 000 00 00"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Сохранить изменения
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: "#111827" }}>
          <Lock size={18} style={{ color: "#6366f1" }} />
          Изменить пароль
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Текущий пароль</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Новый пароль</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              placeholder="Минимум 6 символов"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Подтвердите пароль</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl text-white font-bold transition flex items-center justify-center gap-2"
            style={{ background: "#6366f1", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            Сменить пароль
          </button>
        </form>
      </div>
    </div>
  )
}
