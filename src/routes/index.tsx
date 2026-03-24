import { Routes, Route } from "react-router-dom"
import Dashboard from "../pages/Dashboard"
import Login from "../pages/Login"
import Transactions from "../pages/Transactions"
import Categories from "../pages/Categories"
import MainLayout from "../layouts/MainLayout"
import ProtectedRoute from "./ProtectedRoute"

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={<ProtectedRoute>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>}
      />

      <Route
        path="/transactions"
        element={ <ProtectedRoute>
      <MainLayout>
        <Transactions />
      </MainLayout>
    </ProtectedRoute>}
      />

      <Route
        path="/categories"
        element={<ProtectedRoute>
      <MainLayout>
        <Categories />
      </MainLayout>
    </ProtectedRoute>}
      />

    </Routes>
  )
}