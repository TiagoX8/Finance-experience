import { createContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useAuth } from "auth-lite-react"

export type TransactionType = "income" | "expense"

export interface Transaction {
  id: number
  title: string
  category: string
  amount: number
  type: TransactionType
  date: string
  user_id: number
}

interface TransactionContextType {
  transactions: Transaction[]
  addTransaction: (t: Omit<Transaction, "id" | "user_id">) => Promise<boolean>
  deleteTransaction: (id: number) => Promise<boolean>
  updateTransaction: (updatedTransaction: Omit<Transaction, "user_id">) => Promise<boolean>
  refreshTransactions: () => Promise<void>
  loading: boolean
  error: string
}

export const TransactionContext = createContext<TransactionContextType | null>(null)

const API_URL = "http://127.0.0.1:8000/transactions"

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, loading: authLoading, logout } = useAuth()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const getAuthHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }, [token])

 const handleUnauthorized = useCallback(() => {
  setTransactions([])
  localStorage.setItem("session_expired", "true")
  logout()
}, [logout])

  const refreshTransactions = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setTransactions([])
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
        throw new Error("Falha ao carregar transações")
      }

      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      console.error(err)
      setTransactions([])
      setError("Erro ao carregar transações")
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated, getAuthHeaders, handleUnauthorized])

  useEffect(() => {
    if (authLoading) return
    refreshTransactions()
  }, [authLoading, refreshTransactions])

  async function addTransaction(t: Omit<Transaction, "id" | "user_id">) {
    if (!token) {
      setError("Usuário não autenticado")
      return false
    }

    try {
      setError("")

      const response = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(t),
      })

      if (response.status === 401) {
        handleUnauthorized()
        return false
      }

      if (!response.ok) {
        throw new Error("Falha ao adicionar transação")
      }

      const created = await response.json()
      setTransactions((prev) => [created, ...prev])
      return true
    } catch (err) {
      console.error(err)
      setError("Erro ao adicionar transação")
      return false
    }
  }

  async function deleteTransaction(id: number) {
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
        throw new Error("Falha ao deletar transação")
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id))
      return true
    } catch (err) {
      console.error(err)
      setError("Erro ao deletar transação")
      return false
    }
  }

  async function updateTransaction(updatedTransaction: Omit<Transaction, "user_id">) {
    if (!token) {
      setError("Usuário não autenticado")
      return false
    }

    try {
      setError("")

      const response = await fetch(`${API_URL}/${updatedTransaction.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: updatedTransaction.title,
          category: updatedTransaction.category,
          amount: updatedTransaction.amount,
          type: updatedTransaction.type,
          date: updatedTransaction.date,
        }),
      })

      if (response.status === 401) {
        handleUnauthorized()
        return false
      }

      if (!response.ok) {
        throw new Error("Falha ao atualizar transação")
      }

      const updated = await response.json()

      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      )

      return true
    } catch (err) {
      console.error(err)
      setError("Erro ao atualizar transação")
      return false
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        refreshTransactions,
        loading,
        error,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}