import axios from "axios"

export const API_URL: string =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"

const AUTH_TOKEN_KEY = "auth_token"

export const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === "string") {
      return detail
    }

    if (Array.isArray(detail) && detail[0]?.msg) {
      return detail[0].msg
    }
  }

  return fallback
}
