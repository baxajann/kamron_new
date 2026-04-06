"use client"

import { FileText, Download, TrendingUp, Users, ShoppingCart, AlertCircle, FileSpreadsheet, Package } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto mt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Отчеты и Выгрузка</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Генерация аналитических и финансовых отчетов</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Сводный финансовый отчет", icon: TrendingUp, desc: "Доходы, расходы, прибыль за период" },
          { title: "Дебиторская задолженность", icon: AlertCircle, desc: "Детализация долгов по агентам и периодам" },
          { title: "Отчет по продажам", icon: ShoppingCart, desc: "Объем продаж, возвраты, популярные товары" },
          { title: "KPI и активность", icon: Users, desc: "Оценка работы торговых представителей" },
          { title: "Инвентаризация склада", icon: Package, desc: "Остатки, оборачиваемость, неликвид" },
          { title: "Универсальная выгрузка 1С", icon: FileSpreadsheet, desc: "Экспорт всех реестров в XLSX/CSV для 1С" },
        ].map(card => (
          <div key={card.title} className="card p-6 flex flex-col items-start hover:-translate-y-1 transition-transform cursor-pointer group hover:border-blue-300 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <card.icon size={120} />
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors relative z-10">
              <card.icon size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 relative z-10">{card.title}</h3>
            <p className="text-sm text-gray-500 relative z-10 mb-4">{card.desc}</p>
            <button className="mt-auto px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-medium rounded-lg text-gray-700 transition-colors w-full flex items-center justify-center gap-2 relative z-10 border border-gray-200">
               <Download size={16} /> Сгенерировать
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
