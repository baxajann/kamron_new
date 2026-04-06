"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, TrendingUp, BarChart3, Package, Users, Loader2 } from "lucide-react"
import { toast } from "sonner"

const DEMO_ACCOUNTS = [
  { role: "Администратор", email: "admin@distribcontrol.uz", password: "Admin123" },
  { role: "Менеджер", email: "manager@distribcontrol.uz", password: "Manager123" },
  { role: "Агент", email: "agent1@distribcontrol.uz", password: "Agent123" },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) { setError("Введите электронную почту"); return }
    if (!password) { setError("Введите пароль"); return }

    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Неверный email или пароль")
      } else {
        toast.success("Добро пожаловать в DistribControl!")
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("Ошибка подключения к серверу")
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setError("")
  }

  return (
    <div className="auth-container">
      {/* Left Panel */}
      <div
        className="auth-left-panel relative overflow-hidden flex flex-col justify-between p-10"
        style={{ background: "linear-gradient(145deg, #161d5c 0%, #2e3192 50%, #1a4f8a 100%)" }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #4f6ef7, transparent)" }} />
          <div className="absolute bottom-20 -left-20 w-60 h-60 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #2ea8ff, transparent)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #ffffff, transparent)" }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <BarChart3 size={22} color="white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">DistribControl</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>v2.0 Enterprise</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <h1 className="text-white font-bold mb-4" style={{ fontSize: "28px", lineHeight: 1.2 }}>
            Система управления<br />дистрибуцией
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.7, marginBottom: "36px" }}>
            Комплексная платформа для автоматизации дистрибутивной деятельности — клиенты, заказы, склад, финансы и аналитика в одном месте.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: TrendingUp, label: "Аналитика продаж", desc: "Детальные отчёты" },
              { icon: Users, label: "CRM клиентов", desc: "База 50+ клиентов" },
              { icon: Package, label: "Управление складом", desc: "Остатки в реальном времени" },
              { icon: BarChart3, label: "KPI агентов", desc: "Мониторинг планов" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <Icon size={18} color="#4f9ef7" style={{ marginBottom: "6px" }} />
                <div className="text-white text-xs font-semibold">{label}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
            © 2026 DistribControl. Дипломный проект.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-8" style={{ background: "#f0f2f8" }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <BarChart3 size={24} style={{ color: "#2e3192" }} />
            <span className="font-bold text-lg" style={{ color: "#1a1d2e" }}>DistribControl</span>
          </div>

          <div className="card p-8">
            <h2 className="font-bold mb-1" style={{ fontSize: "22px", color: "#1a1d2e" }}>Вход в систему</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "28px" }}>Введите данные для доступа к платформе</p>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm font-medium" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                  Электронная почта
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@company.uz"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                  Пароль
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input pr-10"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#9ca3af" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "#4f6ef7" }}
                  />
                  <span className="text-sm" style={{ color: "#6b7280" }}>Запомнить меня</span>
                </label>
                <Link href="/forgot-password" className="text-sm font-medium" style={{ color: "#4f6ef7" }}>
                  Забыли пароль?
                </Link>
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Вход...</>
                ) : (
                  "Войти в систему"
                )}
              </button>
            </form>

            <div className="text-center mt-5">
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Нет аккаунта? </span>
              <Link href="/register" className="font-medium text-sm" style={{ color: "#4f6ef7" }}>Создать аккаунт</Link>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 rounded-xl" style={{ background: "#f8fafc", border: "1px solid #e2e6f0" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "#6b7280" }}>ДЕМО-АККАУНТЫ (нажмите для заполнения)</p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="w-full text-left p-2 rounded-lg hover:bg-white transition-colors"
                    style={{ border: "1px solid #e2e6f0" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: "#1a1d2e" }}>{acc.role}</span>
                      <span className="text-xs" style={{ color: "#9ca3af" }}>{acc.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
