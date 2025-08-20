import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LoginPage from './LoginPage'

// Mock the AuthContext
const mockLogin = vi.fn()

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
        isAuthenticated: false,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const renderLoginPage = () => {
    return render(
        <BrowserRouter>
            <LoginPage />
        </BrowserRouter>
    )
}

describe('LoginPage', () => {
    beforeEach(() => {
        mockLogin.mockClear()
    })

    it('renders login form', () => {
        renderLoginPage()
        
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('submits form with email and password', async () => {
        mockLogin.mockResolvedValueOnce(undefined)
        
        renderLoginPage()
        
        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /login/i })
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)
        
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
        })
    })

    it('shows error message when login fails', async () => {
        const errorMessage = 'Invalid email or password'
        mockLogin.mockRejectedValueOnce(new Error(errorMessage))
        
        renderLoginPage()
        
        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /login/i })
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
        fireEvent.click(submitButton)
        
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument()
        })
    })

    it('shows loading state during login', async () => {
        mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
        
        renderLoginPage()
        
        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /login/i })
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)
        
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
    })
})
