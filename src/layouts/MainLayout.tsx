import { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"

interface Props {
  children: ReactNode
}

export default function MainLayout({ children }: Props) {
    const location = useLocation()
  return (
    <div className="flex h-screen">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Finance SaaS</h2>

       <nav className="flex flex-col gap-3">
  
  <Link
    to="/"
    className={`p-2 rounded ${
      location.pathname === "/" 
        ? "bg-gray-700" 
        : "hover:bg-gray-700"
    }`}
  >
    Dashboard
  </Link>

  <Link
    to="/transactions"
    className={`p-2 rounded ${
      location.pathname === "/transactions"
        ? "bg-gray-700"
        : "hover:bg-gray-700"
    }`}
  >
    Transações
  </Link>

  <Link
    to="/categories"
    className={`p-2 rounded ${
      location.pathname === "/categories"
        ? "bg-gray-700"
        : "hover:bg-gray-700"
    }`}
  >
    Categorias
  </Link>

</nav>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <header className="h-16 bg-white shadow flex items-center px-6">
         <h1 className="text-lg font-semibold">
  {location.pathname === "/" && "Dashboard"}
  {location.pathname === "/transactions" && "Transações"}
  {location.pathname === "/categories" && "Categorias"}
</h1>
        </header>

        {/* Conteúdo dinâmico */}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>

      </div>
    </div>
  )
}