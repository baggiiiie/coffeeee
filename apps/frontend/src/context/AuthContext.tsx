import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, CreateUserRequest, LoginRequest, LoginResponse } from '@coffee-companion/shared-types'

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    register: (userData: CreateUserRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const TOKEN_KEY = 'authToken'

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const navigate = useNavigate()

    // Load token from localStorage on mount and migrate legacy key if present
    useEffect(() => {
        const legacyToken = localStorage.getItem('token')
        const savedToken = localStorage.getItem(TOKEN_KEY)
        if (!savedToken && legacyToken) {
            localStorage.setItem(TOKEN_KEY, legacyToken)
            localStorage.removeItem('token')
        }

        const activeToken = savedToken || legacyToken
        if (activeToken) {
            setToken(activeToken)
            setIsAuthenticated(true)
            // TODO: Optionally validate token and load user data
        }
    }, [])

    // Listen for global auth:logout events (e.g., Axios 401 handler)
    useEffect(() => {
        const handler = () => logout()
        window.addEventListener('auth:logout', handler as EventListener)
        return () => window.removeEventListener('auth:logout', handler as EventListener)
    }, [])

    const login = async (email: string, password: string) => {
        try {
            const loginRequest: LoginRequest = { email, password }
            
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginRequest),
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid email or password')
                }
                throw new Error('Login failed')
            }

            const loginResponse: LoginResponse = await response.json()
            
            setUser(loginResponse.user)
            setToken(loginResponse.token)
            setIsAuthenticated(true)
            localStorage.setItem(TOKEN_KEY, loginResponse.token)
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        setIsAuthenticated(false)
        localStorage.removeItem(TOKEN_KEY)
        // Also remove any legacy key if present
        localStorage.removeItem('token')
        // Redirect to login page
        navigate('/login', { replace: true })
    }

    const register = async (userData: CreateUserRequest) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('Email already in use')
                }
                throw new Error('Registration failed')
            }

            const user: User = await response.json()
            
            // For registration, we'll need to log in the user after successful registration
            // This is a simplified approach - in a real app, you might want to handle this differently
            await login(userData.email, userData.password)
        } catch (error) {
            console.error('Registration failed:', error)
            throw error
        }
    }

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated,
        login,
        logout,
        register,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
