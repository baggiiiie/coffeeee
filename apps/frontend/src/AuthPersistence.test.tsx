import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import api from './utils/api'

const TEST_USER = { id: 'u1', username: 'alice', email: 'alice@example.com', createdAt: '', updatedAt: '' }

describe('Auth Persistence & Token Expiry UX (Story 1.8)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('hydrates session on app start when token present (shows Dashboard and Logout)', async () => {
    localStorage.setItem('authToken', 'test-token')

    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: TEST_USER })

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
    expect(screen.getByTestId('logout-button')).toBeInTheDocument()
  })

  it('on invalid token (401) during hydration, logs out, redirects to login, and shows expiry toast', async () => {
    localStorage.setItem('authToken', 'bad-token')

    const error401: any = new Error('Unauthorized')
    error401.response = { status: 401 }
    vi.spyOn(api, 'get').mockRejectedValueOnce(error401)

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>
    )

    // Redirects to login (assert on the page title heading)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument())
    // Shows expiry toast
    expect(screen.getByTestId('session-expired-toast')).toBeInTheDocument()
  })

  it('idempotently handles concurrent 401s (single toast)', async () => {
    localStorage.setItem('authToken', 'bad-token')
    // Resolve hydration to reach authenticated route first
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: TEST_USER })

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())

    // Dispatch two logout events quickly to simulate concurrent 401s
    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'token-expired' } }))
    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'token-expired' } }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument())
    // Only one toast should be present
    const toasts = screen.getAllByTestId('session-expired-toast')
    expect(toasts.length).toBe(1)
  })

  it('ProtectedRoute shows loader while bootstrapping', async () => {
    localStorage.setItem('authToken', 'test-token')

    // Create a never-resolving promise to keep bootstrapping true briefly
    let resolveFn: Function | null = null
    const pending = new Promise((resolve) => { resolveFn = resolve })
    vi.spyOn(api, 'get').mockReturnValueOnce(pending as any)

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    // Clean up the pending promise to avoid unhandled rejection
    resolveFn && resolveFn({ data: TEST_USER })
  })
})
