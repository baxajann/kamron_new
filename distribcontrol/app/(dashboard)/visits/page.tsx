"use client"

import { useState } from "react"
import { Map, List, Search, Filter, Calendar as CalendarIcon, MapPin, Navigation, User, AlertTriangle, Clock } from "lucide-react"

export default function VisitsPage() {
  const [view, setView] = useState<"LIST" | "MAP">("MAP")

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Визиты агентов</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Отслеживание маршрутов в реальном времени</p>
        </div>
        <div className="flex items-center p-1 bg-gray-100 rounded-lg shadow-inner">
          <button 
            onClick={() => setView("MAP")} 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "MAP" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Map size={16} /> Карта
          </button>
          <button 
            onClick={() => setView("LIST")} 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "LIST" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <List size={16} /> Таблица
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Параметры маршрута</h3>
            <div className="relative">
               <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
               <input type="date" className="w-full text-sm pl-9 py-2 border rounded-lg shadow-sm" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <select className="w-full text-sm px-3 py-2 border rounded-lg shadow-sm bg-white">
              <option>Выбрать агента...</option>
              <option>Азизов Рустам</option>
              <option>Каримов Жасур</option>
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Маршрутный лист (12 точек)</div>
            
            {[
              { id: 1, name: "ООО Макро Центр", time: "09:15", status: "VISITED" },
              { id: 2, name: "Магазин Удача", time: "10:30", status: "VISITED" },
              { id: 3, name: "Минимаркет 24/7", time: "11:45", status: "MISSED" },
              { id: 4, name: "Оптовик Базар", time: "13:00", status: "PENDING" },
              { id: 5, name: "Супермаркет Корзинка", time: "14:30", status: "PENDING" },
            ].map((p, i) => (
              <div key={p.id} className="relative pl-6">
                {/* Timeline line */}
                {i < 4 && <div className="absolute left-[9px] top-6 bottom-[-20px] w-0.5 bg-gray-200" />}
                
                {/* Node */}
                <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white z-10
                  ${p.status === "VISITED" ? "border-green-500" : p.status === "MISSED" ? "border-red-500" : "border-gray-300"}`}
                >
                  <div className={`w-2 h-2 rounded-full ${p.status === "VISITED" ? "bg-green-500" : p.status === "MISSED" ? "bg-red-500" : "bg-transparent"}`} />
                </div>

                <div className={`p-3 rounded-lg border shadow-sm ${p.status === "PENDING" ? "bg-white border-gray-100 opacity-60" : p.status === "MISSED" ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
                  <div className="font-semibold text-sm mb-1 text-gray-900">{p.name}</div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-gray-500"><Clock size={12}/> В плане: {p.time}</span>
                    {p.status === "VISITED" && <span className="text-green-600 font-bold tracking-wide">ЗАВЕРШЕНО</span>}
                    {p.status === "MISSED" && <span className="text-red-600 font-bold tracking-wide">ПРОПУСК</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map/List View */}
        <div className="flex-1 bg-gray-100 rounded-xl shadow-sm border border-gray-200 overflow-hidden relative flex flex-col items-center justify-center">
          {view === "MAP" ? (
            <>
              {/* Fake Map Background */}
              <div className="absolute inset-0 z-0 opacity-20" style={{ background: "url('https://api.maptiler.com/maps/basic-v2/256/0/0/0.png') repeat" }} />
              <div className="z-10 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 text-center max-w-sm">
                <Navigation size={48} className="text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Интерактивная карта маршрутов</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">Модуль Яндекс / Google Карт будет подключен на следующем этапе реализации. Ожидает API ключ.</p>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg uppercase tracking-wide">Демонстрационный режим</div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-white flex flex-col items-center justify-center text-gray-500">
               <List size={48} className="text-gray-300 mb-4" />
               <p>Табличный вид маршрутов в разработке</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
