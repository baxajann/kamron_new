"use client"

import { useState, useEffect } from "react"
import { CreditCard, Loader2, Search, TrendingUp, TrendingDown, Wallet, Plus, X, Pencil } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const EMPTY_FORM = { type: "INCOME", amount: "", category: "", method: "CASH", note: "" }

export default function PaymentsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formData, setFormData] = useState<typeof EMPTY_FORM>(EMPTY_FORM)

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/finance/payments?search=${search}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchPayments, 300)
    return () => clearTimeout(t)
  }, [search])

  const openCreate = () => {
    setEditId(null)
    setFormData(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (p: any) => {
    setEditId(p.id)
    setFormData({
      type: p.type || "INCOME",
      amount: String(p.amount),
      category: p.category || "",
      method: p.method || "CASH",
      note: p.note || "",
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditId(null)
    setFormData(EMPTY_FORM)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const isEdit = Boolean(editId)
      const res = await fetch(`/api/finance/payments`, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editId, ...formData } : formData),
      })
      if (res.ok) {
        closeModal()
        fetchPayments()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const methodLabels: Record<string, string> = { CASH: "Наличные", TRANSFER: "Перевод", CARD: "Карта" }
  const methodColors: Record<string, string> = { CASH: "#22c55e", TRANSFER: "#6366f1", CARD: "#f59e0b" }

  const income  = data?.payments?.filter((p: any) => p.type === "INCOME").reduce((s: number, p: any) => s + p.amount, 0) || 0
  const expense = data?.payments?.filter((p: any) => p.type === "EXPENSE").reduce((s: number, p: any) => s + p.amount, 0) || 0
  const balance = income - expense

  return (
    <div className="animate-fade-in relative pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Касса (Приход / Расход)</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Управление платежами и расходами компании</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={18} />
          Выполнить транзакцию
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="kpi-card flex items-center gap-4 border" style={{ borderColor: "#dcfce7" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#f0faf4" }}>
            <TrendingUp size={22} style={{ color: "#22c55e" }} />
          </div>
          <div>
            <div className="text-sm" style={{ color: "#6b7280" }}>Общий приход</div>
            <div className="text-xl font-bold" style={{ color: "#111827" }}>{formatCurrency(income)}</div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4 border" style={{ borderColor: "#fee2e2" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#fef2f2" }}>
            <TrendingDown size={22} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <div className="text-sm" style={{ color: "#6b7280" }}>Общий расход</div>
            <div className="text-xl font-bold" style={{ color: "#111827" }}>{formatCurrency(expense)}</div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4 border" style={{ borderColor: "#e0e7ff" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#e0e7ff" }}>
            <Wallet size={22} style={{ color: "#4f46e5" }} />
          </div>
          <div>
            <div className="text-sm" style={{ color: "#6b7280" }}>Баланс кассы</div>
            <div className="text-xl font-bold" style={{ color: "#111827" }}>{formatCurrency(balance)}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "#e5e7eb" }}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              className="form-input pl-9"
              placeholder="Поиск по клиенту, заказу..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="animate-spin" size={32} style={{ color: "#22c55e" }} />
            </div>
          ) : !data?.payments?.length ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <CreditCard size={40} className="mb-3 text-gray-300" />
              <p className="text-gray-500">Транзакций не найдено</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Тип</th>
                  <th>Клиент / Категория</th>
                  <th>Способ</th>
                  <th>Сумма</th>
                  <th>Заметка</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="text-sm text-gray-700">
                      {new Date(p.paidAt).toLocaleDateString("ru-RU", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td>
                      {p.type === "INCOME" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          <TrendingUp size={12} /> ПРИХОД
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          <TrendingDown size={12} /> РАСХОД
                        </span>
                      )}
                    </td>
                    <td className="font-medium text-sm" style={{ color: "#1a3a2e" }}>
                      {p.client ? `Кл: ${p.client.name}` : (p.category || "—")}
                      {p.order && (
                        <div className="text-xs text-gray-500 font-normal">Заказ: {p.order.orderNumber}</div>
                      )}
                    </td>
                    <td>
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: (methodColors[p.method] || "#6b7280") + "18", color: methodColors[p.method] || "#6b7280" }}
                      >
                        {methodLabels[p.method] || p.method}
                      </span>
                    </td>
                    <td className="font-bold whitespace-nowrap" style={{ color: p.type === "INCOME" ? "#22c55e" : "#ef4444" }}>
                      {p.type === "INCOME" ? "+ " : "− "}{formatCurrency(p.amount)}
                    </td>
                    <td className="text-sm text-gray-500 max-w-[180px] truncate" title={p.note || ""}>
                      {p.note || "—"}
                    </td>
                    <td>
                      <button
                        onClick={() => openEdit(p)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ color: "#6b7280" }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#f0faf4"
                          e.currentTarget.style.color = "#22c55e"
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "transparent"
                          e.currentTarget.style.color = "#6b7280"
                        }}
                        title="Редактировать"
                      >
                        <Pencil size={14} /> Изменить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                {editId ? "Редактировать транзакцию" : "Новая транзакция"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "INCOME" })}
                  className={`py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 border ${formData.type === "INCOME" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                >
                  <TrendingUp size={16} /> Приход
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                  className={`py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 border ${formData.type === "EXPENSE" ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                >
                  <TrendingDown size={16} /> Расход
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Сумма (сум)</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition text-lg font-semibold"
                />
              </div>

              {/* Method */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Способ оплаты</label>
                <select
                  value={formData.method}
                  onChange={e => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-green-500 outline-none transition"
                >
                  <option value="CASH">Наличные</option>
                  <option value="CARD">Пластиковая карта</option>
                  <option value="TRANSFER">Банковский перевод</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Категория / Статья</label>
                <input
                  type="text"
                  placeholder={formData.type === "INCOME" ? "Например: Капитал, Инвестиции" : "Например: Зарплата, Офис, Налоги"}
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-green-500 outline-none transition"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Заметка / Комментарий</label>
                <textarea
                  rows={2}
                  placeholder="Дополнительные детали..."
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-green-500 outline-none transition resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-white font-bold transition flex items-center justify-center gap-2"
                  style={{ background: formData.type === "INCOME" ? "#22c55e" : "#ef4444", opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : editId ? (
                    <Pencil size={18} />
                  ) : (
                    <Wallet size={18} />
                  )}
                  {editId
                    ? "Сохранить изменения"
                    : formData.type === "INCOME"
                    ? "Внести приход"
                    : "Оформить расход"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
