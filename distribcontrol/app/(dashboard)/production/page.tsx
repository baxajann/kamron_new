"use client"

import { useState } from "react"
import { Search, Plus, Filter, Factory, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

const MOCK_TASKS = [
  { id: "PRD-001", product: "Сок Апельсин 1л", qty: 5000, status: "IN_PROGRESS", start: new Date(), progress: 65 },
  { id: "PRD-002", product: "Минеральная вода 1.5л", qty: 10000, status: "PLANNED", start: new Date(Date.now() + 86400000), progress: 0 },
  { id: "PRD-003", product: "Квас хлебный 2л", qty: 2000, status: "COMPLETED", start: new Date(Date.now() - 86400000), progress: 100 },
]

export default function ProductionPage() {
  const [search, setSearch] = useState("")

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Производственные задания</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Планирование и контроль выпуска продукции</p>
        </div>
        <button className="btn-primary"><Plus size={16} className="mr-2" /> Новое задание</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-5 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3 mb-2 text-blue-700">
            <Clock size={20} /> <span className="font-semibold text-sm uppercase">Запланировано</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
          <div className="text-xs text-gray-500">Заданий на неделю</div>
        </div>
        <div className="card p-5 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3 mb-2 text-yellow-700">
            <Factory size={20} /> <span className="font-semibold text-sm uppercase">В производстве</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
          <div className="text-xs text-gray-500">Активных процесса</div>
        </div>
        <div className="card p-5 bg-green-50 border-green-200">
          <div className="flex items-center gap-3 mb-2 text-green-700">
            <CheckCircle2 size={20} /> <span className="font-semibold text-sm uppercase">Завершено</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">48</div>
          <div className="text-xs text-gray-500">За текущий месяц</div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-white rounded-t-xl">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" className="form-input pl-9 border-gray-200 shadow-sm" placeholder="Поиск по продукту..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-secondary px-3 shadow-sm border-gray-200"><Filter size={16} /></button>
        </div>

        <div className="p-0">
          <table className="data-table">
            <thead className="bg-gray-50 text-xs">
              <tr>
                <th>Номер</th>
                <th>Продукт</th>
                <th>План (шт)</th>
                <th>Статус</th>
                <th>Прогресс</th>
                <th>Плановая дата</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TASKS.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="font-mono text-xs font-semibold text-gray-500">{t.id}</td>
                  <td className="font-medium text-gray-900">{t.product}</td>
                  <td className="font-semibold text-blue-600">{t.qty.toLocaleString("ru-RU")}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold leading-none inline-flex items-center gap-1.5
                      ${t.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-800" :
                        t.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {t.status === "IN_PROGRESS" && <Factory size={12}/>}
                      {t.status === "COMPLETED" && <CheckCircle2 size={12}/>}
                      {t.status === "PLANNED" && <Clock size={12}/>}
                      {t.status === "IN_PROGRESS" ? "В процессе" : t.status === "COMPLETED" ? "Завершено" : "В плане"}
                    </span>
                  </td>
                  <td className="min-w-[150px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${t.status === "COMPLETED" ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${t.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-8">{t.progress}%</span>
                    </div>
                  </td>
                  <td className="text-sm text-gray-600">{formatDateTime(t.start).split(',')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
