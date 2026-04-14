"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Plus, FileDown, MoreHorizontal, Users, Shield, Loader2, X, Building2, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useBranch } from "@/lib/branch-context"
import * as XLSX from "xlsx"

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MANAGER: "bg-purple-100 text-purple-700",
  AGENT: "bg-blue-100 text-blue-700",
  WAREHOUSE: "bg-yellow-100 text-yellow-700",
  FINANCE: "bg-green-100 text-green-700",
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Администратор",
  MANAGER: "Менеджер",
  AGENT: "Торговый агент",
  WAREHOUSE: "Зав. складом",
  FINANCE: "Финансист",
}

interface Branch { id: string; name: string }

export default function PersonnelPage() {
  const { selectedBranch } = useBranch()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(selectedBranch && selectedBranch !== "Все филиалы" ? { branch: selectedBranch } : {}),
      })
      const res = await fetch(`/api/personnel?${params}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, selectedBranch])

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300)
    return () => clearTimeout(t)
  }, [fetchUsers])

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setUpdatingId(userId)
    setOpenMenuId(null)
    try {
      const res = await fetch(`/api/personnel/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          users: prev.users.map((u: any) => 
            u.id === userId ? { ...u, status: newStatus } : u
          )
        }))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  const handleDownloadReport = () => {
    if (!data?.users?.length) return

    const rows = data.users.map((u: any) => {
      const kpi = u.kpiRecords?.[0]
      const kpiPercent = kpi ? Math.round((kpi.actualSales / kpi.planSales) * 100) : 0
      return {
        "Сотрудник": u.name,
        "Email": u.email,
        "Должность": ROLE_LABELS[u.role] || u.role,
        "Локация (Филиал)": u.branch?.name || "Все филиалы",
        "KPI План (сум)": kpi ? kpi.planSales : "—",
        "KPI Факт (сум)": kpi ? kpi.actualSales : "—",
        "Выполнение (%)": kpi ? kpiPercent : "Нет плана",
        "Статус": u.status === "ACTIVE" ? "Активный" : "Неактивный",
      }
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Сотрудники")

    // Column widths
    ws["!cols"] = [
      { wch: 25 }, { wch: 30 }, { wch: 20 },
      { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 12 },
    ]

    XLSX.writeFile(wb, `KPI_Отчёт_${new Date().toLocaleDateString("ru-RU").replace(/\./g, "_")}.xlsx`)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Сотрудники</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Управление персоналом и контроль KPI
            {selectedBranch !== "Все филиалы" && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                {selectedBranch}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadReport} className="btn-secondary px-3" disabled={!data?.users?.length}>
            <FileDown size={16} className="mr-2" /> Отчет Excel
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} className="mr-2" /> Добавить сотрудника
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-white rounded-t-xl">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              className="form-input pl-9"
              placeholder="Поиск по ФИО, телефону..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="form-input bg-gray-50 border-gray-200"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">Все должности</option>
              <option value="AGENT">Торговые агенты</option>
              <option value="MANAGER">Менеджеры</option>
              <option value="WAREHOUSE">Зав. складом</option>
              <option value="FINANCE">Финансисты</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : data?.users?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <Users size={40} className="mb-3 text-gray-300" />
              Сотрудники не найдены
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Сотрудник</th>
                  <th>Должность</th>
                  <th>Локация</th>
                  <th>KPI План (текущий мес)</th>
                  <th>KPI Факт</th>
                  <th>Выполнение</th>
                  <th className="text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data?.users?.map((u: any, idx: number) => {
                  const kpi = u.kpiRecords?.[0]
                  const kpiPercent = kpi ? Math.round((kpi.actualSales / kpi.planSales) * 100) : 0

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-gray-100 text-gray-600">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 leading-tight">{u.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-700"}`}>
                          {u.role === "ADMIN" ? <Shield size={12} /> : <Users size={12} />}
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                          <Building2 size={14} className="text-gray-400" />
                          {u.branch?.name || "Все филиалы"}
                        </div>
                      </td>
                      <td className="font-medium text-gray-700">{kpi ? formatCurrency(kpi.planSales) : "—"}</td>
                      <td className="font-semibold text-gray-900">{kpi ? formatCurrency(kpi.actualSales) : "—"}</td>
                      <td>
                        {kpi ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[80px] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${kpiPercent >= 100 ? "bg-green-500" : kpiPercent >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{ width: `${Math.min(100, kpiPercent)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${kpiPercent >= 100 ? "text-green-600" : kpiPercent >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                              {kpiPercent}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Нет плана</span>
                        )}
                      </td>
                      <td className="text-right relative">
                        <button 
                          onClick={() => toggleMenu(u.id)}
                          disabled={updatingId === u.id}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                        >
                          {updatingId === u.id ? <Loader2 size={18} className="animate-spin" /> : <MoreHorizontal size={18} />}
                        </button>

                        {openMenuId === u.id && (
                          <div 
                            className="absolute right-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                            style={idx >= Math.max(0, data.users.length - 2) && data.users.length >= 3 
                              ? { bottom: "calc(100% + 4px)" } 
                              : { top: "calc(100% + 4px)" }
                            }
                          >
                            <div className="p-1.5 focus:outline-none">
                              <button
                                onClick={() => handleStatusChange(u.id, u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                              >
                                <RefreshCw size={15} className="text-blue-500" />
                                Сделать {u.status === "ACTIVE" ? "Неактивным" : "Активным"}
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); fetchUsers() }}
          defaultBranch={selectedBranch}
        />
      )}
    </div>
  )
}

function AddEmployeeModal({ onClose, onSaved, defaultBranch }: {
  onClose: () => void
  onSaved: () => void
  defaultBranch: string
}) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    role: "AGENT", branchId: "",
  })

  useEffect(() => {
    fetch("/api/branches").then(r => r.json()).then(d => {
      setBranches(d.branches || [])
      if (defaultBranch && defaultBranch !== "Все филиалы") {
        const found = (d.branches || []).find((b: Branch) => b.name === defaultBranch)
        if (found) setForm(f => ({ ...f, branchId: found.id }))
      }
    })
  }, [defaultBranch])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Ошибка сохранения"); return }
      onSaved()
    } catch {
      setError("Ошибка подключения к серверу")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold" style={{ color: "#1a1d2e" }}>Добавить сотрудника</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ background: "#fef2f2", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Полное имя *</label>
              <input required className="form-input" placeholder="Иванов Иван Иванович" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Email *</label>
              <input required type="email" className="form-input" placeholder="agent@company.uz" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Пароль *</label>
              <input required type="password" className="form-input" placeholder="Минимум 6 символов" minLength={6} value={form.password} onChange={e => set("password", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Телефон</label>
              <input className="form-input" placeholder="+998..." value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Должность</label>
              <select className="form-input" value={form.role} onChange={e => set("role", e.target.value)}>
                <option value="AGENT">Торговый агент</option>
                <option value="MANAGER">Менеджер</option>
                <option value="WAREHOUSE">Зав. складом</option>
                <option value="FINANCE">Финансист</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Филиал</label>
              <select className="form-input" value={form.branchId} onChange={e => set("branchId", e.target.value)}>
                <option value="">Не выбрано</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Отмена</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={15} className="animate-spin mr-2" /> : <Plus size={15} className="mr-2" />}
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
