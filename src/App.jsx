import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "auth-lite-react"
import { TransactionProvider } from "./contexts/TransactionsContext"
import { CategoriesProvider } from "./contexts/CategoriesContext"
import AppRoutes from "./routes"
import { API_URL } from "./services/api"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider apiUrl={API_URL}>
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