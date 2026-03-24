import { createContext, useState, ReactNode, useEffect } from "react"
import { useNavigate } from "react-router-dom"

interface AuthContextType {
  user: any
  login: (email: string, password: string) => void
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  
  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    setLoading(false) // 👈 FINALIZA CARREGAMENTO
  }, [])

  function login(email: string, password: string) {
    if (email && password) {
      const fakeUser = { email }

      setUser(fakeUser)
      localStorage.setItem("user", JSON.stringify(fakeUser))

      navigate("/")
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem("user")

    navigate("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}