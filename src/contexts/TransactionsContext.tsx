import { createContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useAuth } from "auth-lite-react"
import { api, isUnauthorized } from "../services/api"

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

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, loading: authLoading, logout } = useAuth()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

      const { data } = await api.get("/transactions/")
      setTransactions(data)
    } catch (err) {
      if (isUnauthorized(err)) {
        handleUnauthorized()
        return
      }

      console.error(err)
      setTransactions([])
      setError("Erro ao carregar transações")
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated, handleUnauthorized])

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

      const { data: created } = await api.post("/transactions/", t)
      setTransactions((prev) => [created, ...prev])
      return true
    } catch (err) {
      if (isUnauthorized(err)) {
        handleUnauthorized()
        return false
      }

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

      await api.delete(`/transactions/${id}`)

      setTransactions((prev) => prev.filter((t) => t.id !== id))
      return true
    } catch (err) {
      if (isUnauthorized(err)) {
        handleUnauthorized()
        return false
      }

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

      const { data: updated } = await api.put(
        `/transactions/${updatedTransaction.id}`,
        {
          title: updatedTransaction.title,
          category: updatedTransaction.category,
          amount: updatedTransaction.amount,
          type: updatedTransaction.type,
          date: updatedTransaction.date,
        }
      )

      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      )

      return true
    } catch (err) {
      if (isUnauthorized(err)) {
        handleUnauthorized()
        return false
      }

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