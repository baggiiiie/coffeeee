import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Header from './Header'

// Mock the auth context
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

const mockUseAuth = vi.mocked(await import('../context/AuthContext')).useAuth

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show logout button when user is authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 1, username: 'testuser', email: 'test@example.com', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
            token: 'test-token',
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn()
        })

        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        )

        expect(screen.getByTestId('logout-button')).toBeInTheDocument()
        expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    it('should not show logout button when user is not authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            token: null,
            isAuthenticated: false,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn()
        })

        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        )

        expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument()
        expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })

    it('should show login and signup buttons when user is not authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            token: null,
            isAuthenticated: false,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn()
        })

        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        )

        expect(screen.getByText('Login')).toBeInTheDocument()
        expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('should show navigation buttons when user is authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 1, username: 'testuser', email: 'test@example.com', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
            token: 'test-token',
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn()
        })

        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        )

        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Coffees')).toBeInTheDocument()
        expect(screen.getByText('Profile')).toBeInTheDocument()
    })
})

