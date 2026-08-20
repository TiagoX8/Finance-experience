import { createContext, useEffect, useState, ReactNode, useCallback } from "react"
import { useAuth } from "auth-lite-react"
import { TransactionType } from "./TransactionsContext"
import { api, isUnauthorized } from "../services/api"

export interface Category {
  id: number
  name: string
  type: TransactionType
  user_id: number
}

interface CategoriesContextType {
  categories: Category[]
  addCategory: (payload: Omit<Category, "id" | "user_id">) => Promise<boolean>
  updateCategory: (payload: Omit<Category, "user_id">) => Promise<boolean>
  deleteCategory: (id: number) => Promise<boolean>
  refreshCategories: () => Promise<void>
  loading: boolean
  error: string
}

export const CategoriesContext = createContext<CategoriesContextType | null>(null)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, loading: authLoading, logout } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

const handleUnauthorized = useCallback(() => {
  setCategories([])
  localStorage.setItem("session_expired", "true")
  logout()
}, [logout])

  const refreshCategories = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setCategories([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")

      const { data } = await api.get("/categories/")
      setCategories(data)
    } catch (err) {
      if (isUnauthorized(err)) {
        handleUnauthorized()
        return
      }

      console.error(err)
      setCategories([])
      setError("Erro ao carregar categorias")
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated, handleUnauthorized])

  useEffect(() => {
    if (authLoading) return
    refreshCategories()
  }, [authLoading, refreshCategories])

  async function addCategory(payload: Omit<Category, "id" | "user_id">) {
    if (!token) {
      setError("Usuário não autenticado")
      return false
    }

    try {
      setError("")

      const { data: created } = await api.post("/categories/", payload)
      setCategories((prev) => [...prev, created])
      return true
    } catch (err) {
      if (isUnauthorized(err)) {
        handleUnauthorized()
        return false
      }

      console.error(err)
      setError("Erro ao adicionar categoria")
      return false
    }
  }

  async function updateCategory(payload: Omit<Category, "user_id">) {
    if (!token) {
      setError("Usuário não autenticado")
      return false
    }

    try {
      setError("")

      const { data: updated } = await api.put(`/categories/${payload.id}`, {
        name: payload.name,
        type: payload.type,
      })

      setCategories((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      )

      return true
    } catch (err) {
      if (isUnauthorized(err)) {
        handleUnauthorized()
        return false
      }

      console.error(err)
      setError("Erro ao atualizar categoria")
      return false
    }
  }

  async function deleteCategory(id: number) {
    if (!token) {
      setError("Usuário não autenticado")
      return false
    }

    try {
      setError("")

      await api.delete(`/categories/${id}`)

      setCategories((prev) => prev.filter((item) => item.id !== id))
      return true
    } catch (err) {
      if (isUnauthorized(err)) {
        handleUnauthorized()
        return false
      }

      console.error(err)
      setError("Erro ao excluir categoria")
      return false
    }
  }

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,
        loading,
        error,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  )
}