"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Plus, FileDown, MoreHorizontal, UserCircle, MapPin, Building2, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"
import { formatCurrency, getStatusLabel, getStatusColor } from "@/lib/utils"
import { useBranch } from "@/lib/branch-context"
import Link from "next/link"

interface Branch { id: string; name: string }
interface ClientType { id: string; name: string }

export default function ClientsPage() {
  const { selectedBranch } = useBranch()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        search,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
        ...(selectedBranch && selectedBranch !== "Все филиалы" ? { branch: selectedBranch } : {}),
      })
      const res = await fetch(`/api/clients?${params}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, categoryFilter, selectedBranch])

  useEffect(() => {
    const t = setTimeout(fetchClients, 300)
    return () => clearTimeout(t)
  }, [fetchClients])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, statusFilter, categoryFilter, selectedBranch])

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Клиенты</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Управление клиентской базой
            {selectedBranch !== "Все филиалы" && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                {selectedBranch}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // Export visible clients as CSV
              if (!data?.clients) return
              const rows = [["Название", "Категория", "Тип", "Локация", "Филиал", "Лимит", "Статус"]]
              data.clients.forEach((c: any) => {
                rows.push([c.name, c.category || "-", c.clientType?.name || "-", c.region || "-", c.branch?.name || "-", String(c.debtLimit), getStatusLabel(c.status)])
              })
              const csv = rows.map(r => r.join(";")).join("\n")
              const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a"); a.href = url; a.download = "clients.csv"; a.click()
              URL.revokeObjectURL(url)
            }}
            className="btn-secondary"
          >
            <FileDown size={16} />
            Экспорт
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Добавить клиента
          </button>
        </div>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between" style={{ borderColor: "#f1f5f9" }}>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              className="form-input pl-9"
              placeholder="Поиск по названию, телефону..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary px-3"
              onClick={() => setShowFilters(v => !v)}
              style={showFilters ? { background: "#f0fdf4", borderColor: "#22c55e", color: "#16a34a" } : {}}
            >
              <Filter size={16} className="mr-2" />
              Фильтры
              {(statusFilter || categoryFilter) && (
                <span className="ml-1.5 w-2 h-2 rounded-full bg-green-500 inline-block" />
              )}
            </button>
          </div>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="px-4 py-3 border-b flex flex-wrap gap-3" style={{ borderColor: "#f1f5f9", background: "#f9fafb" }}>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500">Статус:</label>
              <select
                className="form-input py-1 text-sm"
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              >
                <option value="">Все</option>
                <option value="ACTIVE">Активный</option>
                <option value="INACTIVE">Неактивный</option>
                <option value="BLOCKED">Заблокирован</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500">Категория:</label>
              <select
                className="form-input py-1 text-sm"
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
              >
                <option value="">Все</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            {(statusFilter || categoryFilter) && (
              <button
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                onClick={() => { setStatusFilter(""); setCategoryFilter("") }}
              >
                <X size={12} /> Сбросить
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : data?.clients?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <UserCircle size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Ничего не найдено</h3>
              <p className="text-gray-500 max-w-sm mx-auto">По вашему запросу не найдено ни одного клиента. Попробуйте изменить параметры поиска.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Название клиента</th>
                  <th>Категория</th>
                  <th>Тип</th>
                  <th>Локация</th>
                  <th>Филиал</th>
                  <th>Лимит (сум)</th>
                  <th>Статус</th>
                  <th className="text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data?.clients?.map((client: any) => (
                  <tr key={client.id} className="group">
                    <td>
                      <Link href={`/clients/${client.id}`} className="block">
                        <div className="font-semibold text-blue-900 mb-0.5 group-hover:text-blue-600 transition-colors">
                          {client.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {client.contactPerson} • {client.phone}
                        </div>
                      </Link>
                    </td>
                    <td>
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-xs font-bold text-gray-700">
                        {client.category || "-"}
                      </div>
                    </td>
                    <td className="text-gray-600">{client.clientType?.name || "-"}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="truncate max-w-[120px]">{client.region}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Building2 size={14} className="text-gray-400" />
                        {client.branch?.name || "-"}
                      </div>
                    </td>
                    <td className="font-medium">{formatCurrency(client.debtLimit)}</td>
                    <td>
                      <span className={`badge ${getStatusColor(client.status)}`}>
                        {getStatusLabel(client.status)}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Показано {data.clients.length} из {data.total} записей
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="px-3 py-1 text-sm font-medium">
                {page} / {data.pages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); fetchClients() }}
          defaultBranch={selectedBranch}
        />
      )}
    </div>
  )
}

function AddClientModal({ onClose, onSaved, defaultBranch }: {
  onClose: () => void
  onSaved: () => void
  defaultBranch: string
}) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [types, setTypes] = useState<ClientType[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", phone: "", contactPerson: "", region: "",
    category: "", status: "ACTIVE", debtLimit: "",
    branchId: "", clientTypeId: "", address: "", comment: "",
  })

  useEffect(() => {
    fetch("/api/branches").then(r => r.json()).then(d => {
      setBranches(d.branches || [])
      // pre-select branch matching selectedBranch name
      if (defaultBranch && defaultBranch !== "Все филиалы") {
        const found = (d.branches || []).find((b: Branch) => b.name === defaultBranch)
        if (found) setForm(f => ({ ...f, branchId: found.id }))
      }
    })
    fetch("/api/client-types").then(r => r.json()).then(d => setTypes(d.types || []))
  }, [defaultBranch])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/clients", {
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold" style={{ color: "#1a1d2e" }}>Добавить клиента</h2>
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
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Название *</label>
              <input required className="form-input" placeholder="ООО «Название»" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Контактное лицо</label>
              <input className="form-input" placeholder="Иванов Иван" value={form.contactPerson} onChange={e => set("contactPerson", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Телефон</label>
              <input className="form-input" placeholder="+998901234567" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Регион</label>
              <input className="form-input" placeholder="Ташкент" value={form.region} onChange={e => set("region", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Категория</label>
              <select className="form-input" value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="">—</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Филиал</label>
              <select className="form-input" value={form.branchId} onChange={e => set("branchId", e.target.value)}>
                <option value="">Не выбрано</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Тип клиента</label>
              <select className="form-input" value={form.clientTypeId} onChange={e => set("clientTypeId", e.target.value)}>
                <option value="">Не выбрано</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Лимит долга (сум)</label>
              <input type="number" min="0" className="form-input" placeholder="0" value={form.debtLimit} onChange={e => set("debtLimit", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Статус</label>
              <select className="form-input" value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="ACTIVE">Активный</option>
                <option value="INACTIVE">Неактивный</option>
                <option value="BLOCKED">Заблокирован</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Адрес</label>
              <input className="form-input" placeholder="ул. Навои, д. 5" value={form.address} onChange={e => set("address", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Комментарий</label>
              <textarea className="form-input resize-none" rows={2} placeholder="Примечание..." value={form.comment} onChange={e => set("comment", e.target.value)} />
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
