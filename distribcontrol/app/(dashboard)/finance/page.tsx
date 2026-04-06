"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, FileDown, MoreHorizontal, ArrowUpRight, ArrowDownRight, DollarSign, WalletCards, Landmark, CreditCard, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"

export default function FinancePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinance = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/finance?days=30`)
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    fetchFinance()
  }, [])

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Финансы и Касса</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Движение денежных средств и оплаты (за 30 дней)</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary px-3"><FileDown size={16} className="mr-2" /> Отчет</button>
          <button className="btn-secondary px-3"><Plus size={16} className="mr-2" /> Добавить расход</button>
          <button className="btn-primary"><DollarSign size={16} className="mr-2" /> Принять оплату</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-blue-100 text-sm font-medium">Поступления от продаж</div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><ArrowDownRight size={18} className="text-white" /></div>
          </div>
          <div className="text-3xl font-bold mb-1">{loading ? "-" : formatCurrency(data?.summary?.totalPayments)}</div>
          <div className="text-xs text-blue-200 mt-2">Ревеню от заказов: {loading ? "-" : formatCurrency(data?.summary?.totalSales)}</div>
        </div>
        
        <div className="card p-5 flex flex-col justify-center border-l-4 border-l-green-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-50 text-green-600"><WalletCards size={20} /></div>
            <div className="text-sm font-medium text-gray-500">Наличные в кассе</div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{loading ? "-" : formatCurrency(data?.summary?.cashOnHand)}</div>
        </div>

        <div className="card p-5 flex flex-col justify-center border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><Landmark size={20} /></div>
            <div className="text-sm font-medium text-gray-500">На расч. счетах</div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{loading ? "-" : formatCurrency(data?.summary?.bankTransfers)}</div>
        </div>

        <div className="card p-5 flex flex-col justify-center border-l-4 border-l-red-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-50 text-red-600"><AlertCircle size={20} /></div>
            <div className="text-sm font-medium text-gray-500">Общая дебиторка</div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{loading ? "-" : formatCurrency(data?.summary?.totalDebts)}</div>
          <Link href="/debts" className="text-xs text-blue-600 hover:underline mt-2">Развернуть по клиентам →</Link>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex justify-between bg-white rounded-t-xl">
          <h3 className="font-bold text-gray-900">Последние транзакции</h3>
          <div className="flex gap-2">
            <select className="form-input bg-gray-50 border-gray-200 text-sm py-1.5 h-auto">
              <option>Все операции</option>
              <option>Оплаты</option>
              <option>Расходы</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex items-center justify-center h-[300px]"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
          ) : data?.payments?.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">Нет данных за период</div>
          ) : (
            <table className="data-table">
              <thead className="bg-gray-50 uppercase text-xs">
                <tr>
                  <th>Дата</th>
                  <th>Тип операции</th>
                  <th>Контрагент / Клиент</th>
                  <th>Основание</th>
                  <th>Сотрудник</th>
                  <th className="text-right">Сумма</th>
                  <th className="text-right">Метод</th>
                </tr>
              </thead>
              <tbody>
                {data?.payments?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="text-sm text-gray-600">{formatDateTime(p.paidAt)}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        <ArrowDownRight size={14} /> Оплата клиента
                      </span>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900 text-sm">{p.client?.name}</div>
                    </td>
                    <td className="text-sm">
                      Оплата по заказу <Link href={`/sales/orders/${p.debt?.orderId}`} className="text-blue-600 hover:underline font-medium">{p.debt?.order?.orderNumber}</Link>
                    </td>
                    <td>
                      <span className="text-sm text-gray-600">-</span>
                    </td>
                    <td className="text-right font-bold text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-gray-600">
                        {p.paymentMethod === "CASH" ? <WalletCards size={14}/> : p.paymentMethod === "CARD" ? <CreditCard size={14} /> : <Landmark size={14}/>}
                        <span className="text-xs font-medium">{p.paymentMethod === "CASH" ? "Наличные" : p.paymentMethod === "CARD" ? "Карта" : "Перевод"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
