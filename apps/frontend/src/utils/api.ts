import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const TOKEN_KEY = 'authToken'

// Create a singleton Axios instance
export const api = axios.create({
    baseURL: API_BASE_URL,
})

// Attach Authorization header from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
        config.headers = config.headers ?? {}
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

// Auto-logout on 401 responses by dispatching a global event
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = (error.response?.status ?? 0) as number
        if (status === 401) {
            // Emit a custom event for the AuthProvider to handle
            // Include a detail reason so the provider can show appropriate UX
            if (!logoutGuard.isLoggingOut) {
                logoutGuard.isLoggingOut = true
                window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'token-expired' } }))
            }
        }
        return Promise.reject(error)
    }
)

export default api

// Simple idempotency guard for concurrent 401s.
// The AuthProvider can reset this after a successful login/hydration.
export const logoutGuard = {
    isLoggingOut: false,
}

export function resetLogoutGuard() {
    logoutGuard.isLoggingOut = false
}
