"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ShieldAlert, Download, HardDrive, Calendar, CheckCircle2, RefreshCw, Trash2, Clock } from "lucide-react"

interface Backup {
  id: string
  name: string
  size: string
  date: string
  type: "auto" | "manual"
  status: "done" | "failed"
}

const DEMO_BACKUPS: Backup[] = [
  { id: "1", name: "backup_2026-04-07_auto.sql.gz", size: "4.2 MB", date: new Date().toISOString(), type: "auto", status: "done" },
  { id: "2", name: "backup_2026-04-06_auto.sql.gz", size: "4.1 MB", date: new Date(Date.now() - 86400000).toISOString(), type: "auto", status: "done" },
  { id: "3", name: "backup_2026-04-05_manual.sql.gz", size: "4.0 MB", date: new Date(Date.now() - 86400000 * 2).toISOString(), type: "manual", status: "done" },
  { id: "4", name: "backup_2026-04-04_auto.sql.gz", size: "3.9 MB", date: new Date(Date.now() - 86400000 * 3).toISOString(), type: "auto", status: "failed" },
  { id: "5", name: "backup_2026-04-03_auto.sql.gz", size: "3.9 MB", date: new Date(Date.now() - 86400000 * 4).toISOString(), type: "auto", status: "done" },
]

function fmtDate(d: string) {
  return new Date(d).toLocaleString("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>(DEMO_BACKUPS)
  const [creating, setCreating] = useState(false)
  const [autoEnabled, setAutoEnabled] = useState(true)
  const [autoFreq, setAutoFreq] = useState("daily")

  const createBackup = async () => {
    setCreating(true)
    await new Promise(r => setTimeout(r, 2000))
    const newBackup: Backup = {
      id: Date.now().toString(),
      name: `backup_${new Date().toISOString().slice(0, 10)}_manual.sql.gz`,
      size: "4.3 MB",
      date: new Date().toISOString(),
      type: "manual",
      status: "done",
    }
    setBackups(prev => [newBackup, ...prev])
    setCreating(false)
  }

  const deleteBackup = (id: string) => {
    setBackups(prev => prev.filter(b => b.id !== id))
  }

  const totalSize = backups.filter(b => b.status === "done").reduce((acc, b) => acc + parseFloat(b.size), 0)

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
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
            <ShieldAlert size={22} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Резервное копирование</h1>
            <p className="text-sm" style={{ color: "#6b7280" }}>Архивация и восстановление базы данных</p>
          </div>
        </div>
        <button
          onClick={createBackup}
          disabled={creating}
          className="btn-primary"
        >
          {creating
            ? <><RefreshCw size={14} className="animate-spin" /> Создание...</>
            : <><HardDrive size={14} /> Создать резерв</>
          }
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Резервных копий", value: backups.length, icon: HardDrive, color: "#3b82f6" },
          { label: "Общий размер", value: `${totalSize.toFixed(1)} MB`, icon: Calendar, color: "#22c55e" },
          { label: "Последний бэкап", value: "Сегодня", icon: Clock, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <s.icon size={20} style={{ color: s.color, flexShrink: 0 }} />
            <div>
              <div className="font-bold text-sm" style={{ color: "#1a1d2e" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "#9ca3af" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Auto backup settings */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>Автоматическое копирование</h3>
          <button
            onClick={() => setAutoEnabled(!autoEnabled)}
            className="relative w-11 h-6 rounded-full transition-colors shrink-0"
            style={{ background: autoEnabled ? "#22c55e" : "#e5e7eb" }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              style={{ transform: autoEnabled ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </div>
        {autoEnabled && (
          <div className="flex items-center gap-3">
            <label className="text-sm" style={{ color: "#6b7280" }}>Частота:</label>
            <div className="flex gap-2">
              {["hourly", "daily", "weekly"].map(f => (
                <button
                  key={f}
                  onClick={() => setAutoFreq(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: autoFreq === f ? "#22c55e" : "#f1f5f9",
                    color: autoFreq === f ? "white" : "#6b7280",
                  }}
                >
                  {f === "hourly" ? "Каждый час" : f === "daily" ? "Ежедневно" : "Еженедельно"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backup list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <span className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>История резервных копий</span>
          <span className="text-xs" style={{ color: "#9ca3af" }}>{backups.length} файлов</span>
        </div>
        <ul className="divide-y" style={{ borderColor: "#f1f5f9" }}>
          {backups.map(backup => (
            <li key={backup.id} className="flex items-center gap-3 px-5 py-3.5 group hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: backup.status === "done" ? "#f0fdf4" : "#fef2f2" }}>
                {backup.status === "done"
                  ? <CheckCircle2 size={16} style={{ color: "#22c55e" }} />
                  : <ShieldAlert size={16} style={{ color: "#ef4444" }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: "#1a1d2e" }}>{backup.name}</div>
                <div className="text-xs" style={{ color: "#9ca3af" }}>
                  {fmtDate(backup.date)} · {backup.size} ·{" "}
                  <span style={{ color: backup.type === "auto" ? "#3b82f6" : "#8b5cf6" }}>
                    {backup.type === "auto" ? "Авто" : "Ручной"}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  title="Скачать"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: "#3b82f6" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Download size={13} />
                </button>
                <button
                  onClick={() => deleteBackup(backup.id)}
                  title="Удалить"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: "#ef4444" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
