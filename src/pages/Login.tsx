import { useNavigate, Link, useLocation } from "react-router-dom"
import { useAuth } from "auth-lite-react"
import { useEffect, useState } from "react"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const sessionExpired = localStorage.getItem("session_expired")

    if (sessionExpired === "true") {
      setInfo("Sua sessão expirou. Faça login novamente.")
      localStorage.removeItem("session_expired")
    }
  }, [])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const from = location.state?.from || "/dashboard"
      navigate(from)
    }
  }, [authLoading, isAuthenticated, navigate, location.state])

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()

    setLoading(true)
    setError("")
    setInfo("")

    const result = await login(email, password)

    setLoading(false)

    if (result.success) {
      window.location.href = location.state?.from || "/dashboard"
    } else {
      setError(result.error || "Credenciais inválidas")
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border">
          <p className="text-sm text-gray-600">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
              <LogIn className="text-blue-600" size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">Entrar</h1>
              <p className="text-sm text-gray-500 mt-1">
                Acesse sua conta para continuar no Finance SaaS
              </p>
            </div>
          </div>

          {info && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
              {info}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Senha</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="text-sm text-center text-gray-500">
            Ainda não tem conta?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}