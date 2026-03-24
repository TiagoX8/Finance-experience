import { useEffect, useState } from "react"

interface Transaction {
  id: number
  description: string
  amount: number
  type: "income" | "expense"
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

useEffect(() => {
  function loadTransactions() {
    const stored = localStorage.getItem("transactions")

    if (stored) {
      setTransactions(JSON.parse(stored))
    }
  }

  loadTransactions()

  // Atualiza ao voltar para a aba
  window.addEventListener("focus", loadTransactions)

  return () => {
    window.removeEventListener("focus", loadTransactions)
  }
}, [])

  //  cálculos
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0)

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0)

  const balance = income - expense

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4">

        {/* Receita */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">Receitas</h3>
          <p className="text-2xl font-bold text-green-600">
            R$ {income}
          </p>
        </div>

        {/* Despesa */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">Despesas</h3>
          <p className="text-2xl font-bold text-red-600">
            R$ {expense}
          </p>
        </div>

        {/* Saldo */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">Saldo</h3>
          <p className="text-2xl font-bold">
            R$ {balance}
          </p>
        </div>

      </div>
    </div>
  )
}