"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, BarChart3, Loader2 } from "lucide-react"
import { toast } from "sonner"

const ROLES = [
  { value: "AGENT", label: "Торговый агент" },
  { value: "MANAGER", label: "Менеджер" },
  { value: "FINANCE", label: "Финансовый менеджер" },
  { value: "WAREHOUSE", label: "Сотрудник склада" },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "AGENT", phone: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.name) { setError("Введите ФИО"); return }
    if (!form.email) { setError("Введите email"); return }
    if (form.password.length < 6) { setError("Пароль должен быть не менее 6 символов"); return }
    if (form.password !== form.confirmPassword) { setError("Пароли не совпадают"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Ошибка регистрации"); return }
      toast.success("Аккаунт создан! Войдите в систему.")
      router.push("/login")
    } catch {
      setError("Ошибка подключения")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-left-panel relative overflow-hidden flex flex-col justify-center p-10"
        style={{ background: "linear-gradient(145deg, #161d5c 0%, #2e3192 50%, #1a4f8a 100%)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #4f6ef7, transparent)" }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <BarChart3 size={22} color="white" />
            </div>
            <span className="text-white font-bold text-lg">DistribControl</span>
          </div>
          <h2 className="text-white font-bold mb-4" style={{ fontSize: "26px" }}>Присоединяйтесь к<br />платформе</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.7 }}>
            Создайте аккаунт для доступа к системе управления дистрибуцией. Быстро, безопасно, профессионально.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8" style={{ background: "#f0f2f8" }}>
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h2 className="font-bold mb-1" style={{ fontSize: "22px" }}>Создать аккаунт</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>Заполните данные для регистрации</p>

            {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>ФИО *</label>
                <input className="form-input" placeholder="Иванов Иван Иванович" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Email *</label>
                <input type="email" className="form-input" placeholder="email@company.uz" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Телефон</label>
                <input className="form-input" placeholder="+998 90 123 45 67" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Роль</label>
                <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Пароль *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} className="form-input pr-10" placeholder="Минимум 6 символов" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Подтвердите пароль *</label>
                <input type="password" className="form-input" placeholder="Повторите пароль" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Регистрация...</> : "Создать аккаунт"}
              </button>
            </form>

            <div className="text-center mt-4">
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Уже есть аккаунт? </span>
              <Link href="/login" className="font-medium text-sm" style={{ color: "#4f6ef7" }}>Войти</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
