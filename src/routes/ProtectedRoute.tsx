import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const auth = useContext(AuthContext)

  // Enquanto verifica o usuário (localStorage)
  if (auth?.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    )
  }

  
  if (!auth?.user) {
    return <Navigate to="/login" replace />
  }

  
  return <>{children}</>
}