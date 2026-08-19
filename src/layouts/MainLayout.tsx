import { ReactNode, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "auth-lite-react"
import {
  LayoutDashboard,
  ArrowRightLeft,
  Tags,
  LogOut,
  User,
  Loader2,
} from "lucide-react"

interface Props {
  children: ReactNode
}

interface ExchangeRates {
  usdBrl: string
  eurBrl: string
}

export default function MainLayout({ children }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [rates, setRates] = useState<ExchangeRates>({
    usdBrl: "",
    eurBrl: "",
  })
  const [loggingOut, setLoggingOut] = useState(false)

  function handleLogout() {
    setLoggingOut(true)
    logout()
    navigate("/login", { replace: true })
  }

  useEffect(() => {
    async function loadRates() {
      try {
        const response = await fetch(
          "https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,BRL"
        )

        if (!response.ok) {
          throw new Error("Erro ao carregar cotações")
        }

        const data = await response.json()

        const eurToBrl = Number(data.rates.BRL)
        const eurToUsd = Number(data.rates.USD)

        if (eurToBrl && eurToUsd) {
          const usdToBrl = eurToBrl / eurToUsd

          setRates({
            usdBrl: usdToBrl.toFixed(2),
            eurBrl: eurToBrl.toFixed(2),
          })
        }
      } catch (error) {
        console.error("Erro ao carregar cotações:", error)
      }
    }

    loadRates()
  }, [])

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Transações",
      path: "/transactions",
      icon: ArrowRightLeft,
    },
    {
      name: "Categorias",
      path: "/categories",
      icon: Tags,
    },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between">
        <div>
          <div className="p-6 text-xl font-bold border-b border-gray-800">
            Finance SaaS
          </div>

          <nav className="p-4 flex flex-col gap-2">
            {menu.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    active ? "bg-gray-800" : "hover:bg-gray-800"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <User size={18} />
            <span className="text-sm truncate">{user?.email || "Usuário"}</span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 disabled:opacity-60 transition text-sm"
          >
            {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            {loggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">
            {location.pathname === "/dashboard" && "Dashboard"}
            {location.pathname === "/transactions" && "Transações"}
            {location.pathname === "/categories" && "Categorias"}
          </h1>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <span className="font-medium">USD</span>: R$ {rates.usdBrl || "--"}
              </div>

              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <span className="font-medium">EUR</span>: R$ {rates.eurBrl || "--"}
              </div>
            </div>

            <div className="text-sm text-gray-600">{user?.email}</div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}