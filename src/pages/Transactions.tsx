import { useState, useEffect } from "react"

interface Transaction {
  id: number
  description: string
  amount: number
  type: "income" | "expense"
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("income")

  // 🔄 Carregar do localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions")

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    }
  }, [])

  // 💾 Salvar automaticamente
  useEffect(() => {
    if (transactions.length === 0) return

    localStorage.setItem("transactions", JSON.stringify(transactions))
  }, [transactions])

  // ➕ Adicionar transação
  function handleAddTransaction() {
    if (!description || !amount) return

    const newTransaction: Transaction = {
      id: Date.now(),
      description,
      amount: Number(amount),
      type,
    }

    setTransactions([...transactions, newTransaction])

    setDescription("")
    setAmount("")
    setType("income")
  }

  // ❌ Deletar transação
  function handleDelete(id: number) {
    const filtered = transactions.filter((t) => t.id !== id)
    setTransactions(filtered)
  }

  // 💰 Calcular saldo
  const balance = transactions.reduce((acc, t) => {
    return t.type === "income"
      ? acc + t.amount
      : acc - t.amount
  }, 0)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Transações</h2>

      {/* 💰 SALDO */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="text-lg">Saldo</h3>
        <p className="text-2xl font-bold">
          R$ {balance}
        </p>
      </div>

      {/* FORMULÁRIO */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <input
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 mr-2"
        />

        <input
          type="number"
          placeholder="Valor"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 mr-2"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
          className="border p-2 mr-2"
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>

        <button
          onClick={handleAddTransaction}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Adicionar
        </button>
      </div>

      {/* LISTA */}
      <div className="bg-white p-4 rounded shadow">
        {transactions.length === 0 ? (
          <p>Nenhuma transação cadastrada</p>
        ) : (
          <ul>
            {transactions.map((t) => (
              <li
                key={t.id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>{t.description}</span>

                <span
                  className={
                    t.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  R$ {t.amount}
                </span>

                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-red-500 hover:underline ml-4"
                >
                  Deletar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}