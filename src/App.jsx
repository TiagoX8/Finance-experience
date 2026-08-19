import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "auth-lite-react"
import { TransactionProvider } from "./contexts/TransactionsContext"
import { CategoriesProvider } from "./contexts/CategoriesContext"
import AppRoutes from "./routes"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CategoriesProvider>
          <TransactionProvider>
            <AppRoutes />
          </TransactionProvider>
        </CategoriesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App