import { useContext, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"

export default function Login() {
  const auth = useContext(AuthContext)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleLogin() {
    auth?.login(email, password)
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded shadow w-80">
        
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Entrar
        </button>

      </div>
    </div>
  )
}