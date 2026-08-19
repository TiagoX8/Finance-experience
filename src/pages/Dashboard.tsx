import { useContext, useMemo, useState } from "react"
import { TransactionContext } from "../contexts/TransactionsContext"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts"

export default function Dashboard() {
  const context = useContext(TransactionContext)
  const transactions = context?.transactions || []
  const loading = context?.loading || false

  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [period, setPeriod] = useState("all")

  const formatCurrency = (value: number) =>
    Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })

  const categories = useMemo(() => {
    const unique = [...new Set(transactions.map((t) => t.category))]
    return ["Todas", ...unique]
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    if (selectedCategory === "Todas") return transactions
    return transactions.filter((t) => t.category === selectedCategory)
  }, [transactions, selectedCategory])

  function filterByPeriod(list: typeof filteredTransactions) {
    const now = new Date()

    return list.filter((t) => {
      if (period === "all") return true

      const date = new Date(t.date)
      const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

      if (period === "7") return diff <= 7
      if (period === "30") return diff <= 30
      if (period === "90") return diff <= 90

      return true
    })
  }

  const filteredByPeriod = useMemo(
    () => filterByPeriod(filteredTransactions),
    [filteredTransactions, period]
  )

  const income = filteredByPeriod
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)

  const expense = filteredByPeriod
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)

  const balance = income - expense

  const pieData = [
    { name: "Receitas", value: income },
    { name: "Despesas", value: expense },
  ]

  const COLORS = ["#22c55e", "#ef4444"]

  const groupedByDate = filteredByPeriod.reduce((acc: any, t: any) => {
    const date = t.date || "Sem data"

    if (!acc[date]) {
      acc[date] = { date, income: 0, expense: 0 }
    }

    if (t.type === "income") acc[date].income += Number(t.amount || 0)
    if (t.type === "expense") acc[date].expense += Number(t.amount || 0)

    return acc
  }, {})

  const lineData = Object.values(groupedByDate)

  const groupedByCategory = filteredByPeriod.reduce((acc: any, t: any) => {
    const category = t.category || "Sem categoria"

    if (!acc[category]) {
      acc[category] = { category, total: 0 }
    }

    acc[category].total += Number(t.amount || 0)

    return acc
  }, {})

  const categoryData = Object.values(groupedByCategory)

  const recentTransactions = [...filteredByPeriod].slice(-5).reverse()

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Financeiro</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Dashboard Financeiro
          </h2>
          <p className="text-gray-500 text-sm">
            Visão geral das suas finanças
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            <option value="all">Tudo</option>
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Receitas</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(income)}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Despesas</p>
          <h3 className="text-2xl font-bold text-red-500 mt-2">
            {formatCurrency(expense)}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Saldo</p>
          <h3
            className={`text-2xl font-bold mt-2 ${
              balance >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {formatCurrency(balance)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Evolução Financeira
          </h3>

          <div className="w-full h-[300px]">
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend />
                <Line type="monotone" dataKey="income" name="Receitas" />
                <Line type="monotone" dataKey="expense" name="Despesas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Distribuição
          </h3>

          <div className="w-full h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={100}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Gastos por Categoria
        </h3>

        <div className="w-full h-[300px]">
          <ResponsiveContainer>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="total" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mt-6">
        <h3 className="text-lg font-semibold mb-4">
          Últimas Transações
        </h3>

        {filteredByPeriod.length === 0 ? (
          <p className="text-gray-500">
            Nenhuma transação registrada
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentTransactions.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">
                    {t.title?.trim() || "Sem descrição"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t.category} • {t.type === "income" ? "Receita" : "Despesa"} • {t.date}
                  </p>
                </div>

                <p
                  className={`font-semibold ${
                    t.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}