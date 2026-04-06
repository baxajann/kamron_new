"use client"

import { Building2, Settings, Users, ArrowUpRight, ShieldAlert, Laptop, ShieldCheck } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto mt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Настройки системы</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Конфигурация параметров платформы DistribControl</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Профиль компании", icon: Building2, desc: "Реквизиты, название, контакты" },
          { title: "Роли и Права", icon: ShieldCheck, desc: "Управление доступом сотрудников" },
          { title: "Пользователи", icon: Users, desc: "Управление учетными записями", href: "/personnel" },
          { title: "Устройства и сессии", icon: Laptop, desc: "Активные входы агентов" },
          { title: "Резервное копирование", icon: ShieldAlert, desc: "Архивация базы данных" },
          { title: "Интеграции (1C, API)", icon: Settings, desc: "Внешние подключения" },
        ].map(card => (
          <div key={card.title} className="card p-6 flex flex-col items-start hover:-translate-y-1 transition-transform cursor-pointer group hover:border-blue-300">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <card.icon size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{card.title}</h3>
            <p className="text-sm text-gray-500">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
