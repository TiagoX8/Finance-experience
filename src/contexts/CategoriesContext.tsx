import { createContext, useEffect, useState, ReactNode, useCallback } from "react"
import { useAuth } from "auth-lite-react"
import { TransactionType } from "./TransactionsContext"

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

const API_URL = "http://127.0.0.1:8000/categories"

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, loading: authLoading, logout } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const getAuthHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }, [token])

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

      const response = await fetch(`${API_URL}/`, {
        headers: getAuthHeaders(),
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error("Falha ao carregar categorias")
      }

      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error(err)
      setCategories([])
      setError("Erro ao carregar categorias")
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated, getAuthHeaders, handleUnauthorized])

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

      const response = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        handleUnauthorized()
        return false
      }

      if (!response.ok) {
        throw new Error("Falha ao adicionar categoria")
      }

      const created = await response.json()
      setCategories((prev) => [...prev, created])
      return true
    } catch (err) {
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

      const response = await fetch(`${API_URL}/${payload.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: payload.name,
          type: payload.type,
        }),
      })

      if (response.status === 401) {
        handleUnauthorized()
        return false
      }

      if (!response.ok) {
        throw new Error("Falha ao atualizar categoria")
      }

      const updated = await response.json()

      setCategories((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      )

      return true
    } catch (err) {
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

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (response.status === 401) {
        handleUnauthorized()
        return false
      }

      if (!response.ok) {
        throw new Error("Falha ao excluir categoria")
      }

      setCategories((prev) => prev.filter((item) => item.id !== id))
      return true
    } catch (err) {
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