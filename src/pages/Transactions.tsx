import { useState, useContext, useMemo } from "react"
import {
  TransactionContext,
  TransactionType,
  Transaction,
} from "../contexts/TransactionsContext"
import { CategoriesContext } from "../contexts/CategoriesContext"

export default function Transactions() {
  const transactionContext = useContext(TransactionContext)
  const categoriesContext = useContext(CategoriesContext)

  const transactions = transactionContext?.transactions || []
  const addTransaction = transactionContext?.addTransaction
  const deleteTransaction = transactionContext?.deleteTransaction
  const updateTransaction = transactionContext?.updateTransaction
  const apiError = transactionContext?.error || ""

  const categories = categoriesContext?.categories || []

  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<TransactionType>("income")
  const [category, setCategory] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const ITEMS_PER_PAGE = 5

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  )

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })

  function formatInputCurrency(value: string) {
    const numeric = value.replace(/\D/g, "")
    const number = Number(numeric) / 100

    if (!numeric) return ""

    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function parseCurrency(value: string) {
    return Number(value.replace(/\D/g, "")) / 100
  }

  function validate() {
    if (!title.trim()) return "Informe uma descrição"
    if (!amount || parseCurrency(amount) <= 0) return "Informe um valor válido"
    if (!category) return "Selecione uma categoria"
    return ""
  }

  function resetForm() {
    const defaultCategory =
      categories.find((c) => c.type === "income")?.name || ""

    setTitle("")
    setAmount("")
    setType("income")
    setCategory(defaultCategory)
    setEditingId(null)
    setError("")
  }

  function handleTypeChange(newType: TransactionType) {
    setType(newType)

    const defaultCategory =
      categories.find((c) => c.type === newType)?.name || ""

    setCategory(defaultCategory)
  }

  async function handleSubmit() {
    const validationError = validate()

    if (validationError) {
      setError(validationError)
      setSuccess("")
      return
    }

    setError("")
    setSuccess("")
    setSubmitting(true)

    const existing = editingId
      ? transactions.find((t) => t.id === editingId)
      : null

    const transactionDate =
      existing?.date || new Date().toISOString().split("T")[0]

    const payload = {
      title: title.trim(),
      amount: parseCurrency(amount),
      type,
      category,
      date: transactionDate,
    }

    let ok = false

    if (editingId && updateTransaction) {
      ok = await updateTransaction({
        id: editingId,
        ...payload,
      })
    } else {
      ok = (await addTransaction?.(payload)) || false
    }

    setSubmitting(false)

    if (ok) {
      setSuccess(
        editingId
          ? "Transação atualizada com sucesso"
          : "Transação adicionada com sucesso"
      )
      resetForm()
    } else {
      setError("Não foi possível salvar a transação")
    }
  }

  function handleEdit(transaction: Transaction) {
    setTitle(transaction.title)
    setAmount(formatCurrency(transaction.amount))
    setType(transaction.type)
    setCategory(transaction.category)
    setEditingId(transaction.id)
    setError("")
    setSuccess("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleDelete(id: number) {
    setSuccess("")
    const ok = await deleteTransaction?.(id)

    if (ok) {
      setSuccess("Transação removida com sucesso")
    } else {
      setError("Não foi possível remover a transação")
    }
  }

  const balance = transactions.reduce((acc, t) => {
    return t.type === "income" ? acc + t.amount : acc - t.amount
  }, 0)

  const paginatedTransactions = [...transactions]
    .reverse()
    .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Transações</h2>

      <div className="bg-white p-5 rounded-xl shadow-sm border">
        <p className="text-sm text-gray-500">Saldo atual</p>
        <h3
          className={`text-2xl font-bold mt-2 ${
            balance >= 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {formatCurrency(balance)}
        </h3>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm">
            {error}
          </div>
        )}

        {!error && apiError && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm">
            {apiError}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded text-sm">
            {success}
          </div>
        )}

        <input
          type="text"
          placeholder="Ex: Aluguel, Salário, Mercado..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <input
          type="text"
          placeholder="Valor (R$)"
          value={amount}
          onChange={(e) => setAmount(formatInputCurrency(e.target.value))}
          className="w-full border p-3 rounded"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
            className="border p-3 rounded"
          >
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-3 rounded"
          >
            <option value="">Selecione uma categoria</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded font-semibold"
          >
            {submitting
              ? "Salvando..."
              : editingId
              ? "Salvar Alterações"
              : "Adicionar Transação"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="px-4 py-3 rounded font-semibold border"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Histórico</h3>

        {transactions.length === 0 ? (
          <p className="text-gray-500">Nenhuma transação cadastrada</p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-gray-500">
                      {t.category} • {t.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p
                      className={`font-semibold ${
                        t.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(t.amount)}
                    </p>

                    <button
                      onClick={() => handleEdit(t)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Anterior
              </button>

              <span className="text-sm">
                Página {page} de {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}