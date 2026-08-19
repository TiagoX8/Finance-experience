import { useContext, useMemo, useState } from "react"
import { CategoriesContext } from "../contexts/CategoriesContext"
import { TransactionType } from "../contexts/TransactionsContext"

export default function Categories() {
  const context = useContext(CategoriesContext)

  const categories = context?.categories || []
  const addCategory = context?.addCategory
  const updateCategory = context?.updateCategory
  const deleteCategory = context?.deleteCategory
  const loading = context?.loading || false
  const apiError = context?.error || ""

  const [name, setName] = useState("")
  const [type, setType] = useState<TransactionType>("expense")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income"),
    [categories]
  )

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  )

  function resetForm() {
    setName("")
    setType("expense")
    setEditingId(null)
    setError("")
  }

  async function handleSubmit() {
    const trimmedName = name.trim()

    if (!trimmedName) {
      setError("Informe o nome da categoria")
      setSuccess("")
      return
    }

    const duplicated = categories.some(
      (c) =>
        c.name.toLowerCase() === trimmedName.toLowerCase() &&
        c.type === type &&
        c.id !== editingId
    )

    if (duplicated) {
      setError("Já existe uma categoria com esse nome nesse tipo")
      setSuccess("")
      return
    }

    setError("")
    setSuccess("")
    setSubmitting(true)

    let ok = false

    if (editingId && updateCategory) {
      ok = await updateCategory({
        id: editingId,
        name: trimmedName,
        type,
      })
    } else {
      ok = (await addCategory?.({
        name: trimmedName,
        type,
      })) || false
    }

    setSubmitting(false)

    if (ok) {
      setSuccess(editingId ? "Categoria atualizada com sucesso" : "Categoria adicionada com sucesso")
      resetForm()
    } else {
      setError("Não foi possível salvar a categoria")
    }
  }

  function handleEdit(category: { id: number; name: string; type: TransactionType }) {
    setName(category.name)
    setType(category.type)
    setEditingId(category.id)
    setError("")
    setSuccess("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleDelete(id: number) {
    setSuccess("")
    const ok = await deleteCategory?.(id)

    if (ok) {
      setSuccess("Categoria removida com sucesso")
    } else {
      setError("Não foi possível remover a categoria")
    }

    if (editingId === id) {
      resetForm()
    }
  }

  function CategorySection({
    title,
    items,
    titleClassName,
    badgeClassName,
  }: {
    title: string
    items: typeof categories
    titleClassName: string
    badgeClassName: string
  }) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${titleClassName}`}>{title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${badgeClassName}`}>
            {items.length} categorias
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma categoria cadastrada</p>
        ) : (
          <div className="space-y-3">
            {items.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <span className="font-medium text-gray-800">{category.name}</span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Categorias</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500">Carregando categorias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Categorias</h2>
        <p className="text-gray-500 text-sm">
          Gerencie as categorias usadas nas suas transações
        </p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome da categoria"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-3 rounded"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className="border p-3 rounded"
          >
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
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
              : "Adicionar Categoria"}
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CategorySection
          title="Categorias de Receita"
          items={incomeCategories}
          titleClassName="text-green-600"
          badgeClassName="bg-green-100 text-green-700"
        />

        <CategorySection
          title="Categorias de Despesa"
          items={expenseCategories}
          titleClassName="text-red-500"
          badgeClassName="bg-red-100 text-red-600"
        />
      </div>
    </div>
  )
}