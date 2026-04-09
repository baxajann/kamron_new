"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Save, Phone, Mail, Globe, MapPin, FileText, Hash } from "lucide-react"

const INITIAL = {
  name: "DistribControl LLC",
  inn: "302 456 789",
  ogrn: "1197746123456",
  director: "Каримов Рустам Алишерович",
  phone: "+998 71 123-45-67",
  email: "info@distribcontrol.uz",
  website: "www.distribcontrol.uz",
  address: "г. Ташкент, ул. Амира Темура, д. 42, офис 301",
  description: "Дистрибуционная компания, специализирующаяся на FMCG-товарах по всему Узбекистану.",
  currency: "UZS",
  timezone: "Asia/Tashkent",
}

export default function CompanyPage() {
  const [form, setForm] = useState(INITIAL)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleChange = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto mt-4">
      {/* Back */}
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors" style={{ color: "#6b7280" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#22c55e")}
        onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
      >
        <ArrowLeft size={15} /> Назад к настройкам
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <Building2 size={22} style={{ color: "#22c55e" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Профиль компании</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>Реквизиты, название, контакты</p>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        {/* Basic info */}
        <section>
          <h2 className="text-sm font-semibold mb-4 pb-2 border-b" style={{ color: "#374151" }}>
            Основная информация
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>
                Название компании
              </label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  className="form-input pl-9"
                  value={form.name}
                  onChange={e => handleChange("name", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>ИНН</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input className="form-input pl-9" value={form.inn} onChange={e => handleChange("inn", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>ОГРН / Свидетельство</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input className="form-input pl-9" value={form.ogrn} onChange={e => handleChange("ogrn", e.target.value)} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>Директор / Руководитель</label>
              <input className="form-input" value={form.director} onChange={e => handleChange("director", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Contacts */}
        <section>
          <h2 className="text-sm font-semibold mb-4 pb-2 border-b" style={{ color: "#374151" }}>
            Контактные данные
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>Телефон</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input className="form-input pl-9" value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input className="form-input pl-9" value={form.email} onChange={e => handleChange("email", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>Веб-сайт</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input className="form-input pl-9" value={form.website} onChange={e => handleChange("website", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>Валюта</label>
              <select className="form-input" value={form.currency} onChange={e => handleChange("currency", e.target.value)}>
                <option value="UZS">UZS — Узбекский сум</option>
                <option value="USD">USD — Доллар США</option>
                <option value="EUR">EUR — Евро</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>Адрес</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3.5" style={{ color: "#9ca3af" }} />
                <input className="form-input pl-9" value={form.address} onChange={e => handleChange("address", e.target.value)} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>Описание компании</label>
              <textarea
                className="form-input resize-none"
                rows={3}
                value={form.description}
                onChange={e => handleChange("description", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* System */}
        <section>
          <h2 className="text-sm font-semibold mb-4 pb-2 border-b" style={{ color: "#374151" }}>
            Системные параметры
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>Часовой пояс</label>
              <select className="form-input" value={form.timezone} onChange={e => handleChange("timezone", e.target.value)}>
                <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                <option value="Asia/Almaty">Asia/Almaty (UTC+6)</option>
                <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t">
          {saved && (
            <span className="text-sm font-medium" style={{ color: "#22c55e" }}>
              ✓ Изменения сохранены
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            <Save size={15} />
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </div>
    </div>
  )
}
