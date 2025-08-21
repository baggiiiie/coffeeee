import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, CreateUserRequest, LoginRequest, LoginResponse } from '@coffee-companion/shared-types'
import api from '../utils/api'

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

const TOKEN_KEY = 'authToken'

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isHydrating, setIsHydrating] = useState(true)
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
            // Hydrate user data from token
            hydrateUser(activeToken)
        } else {
            setIsHydrating(false)
        }
    }, [])

    // Listen for global auth:logout events (e.g., Axios 401 handler)
    useEffect(() => {
        const handler = () => logout()
        window.addEventListener('auth:logout', handler as EventListener)
        return () => window.removeEventListener('auth:logout', handler as EventListener)
    }, [])

    const hydrateUser = async (token: string) => {
        try {
            // Set the token in localStorage to ensure API interceptor picks it up
            localStorage.setItem(TOKEN_KEY, token)

            // Call the /users/me endpoint to get current user data
            const response = await api.get('/api/v1/users/me')
            const userData: User = response.data

            setUser(userData)
            setIsAuthenticated(true)
        } catch (error: any) {
            console.error('Failed to hydrate user:', error)
            // If hydration fails (401, etc.), clear the token and remain unauthenticated
            logout()
        } finally {
            setIsHydrating(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const loginRequest: LoginRequest = { email, password }

            const response = await api.post('/api/v1/auth/login', loginRequest)
            const loginResponse: LoginResponse = response.data

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
            await api.post('/api/v1/users', userData)

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

    // Don't render children until hydration is complete to avoid flashing
    if (isHydrating) {
        return <div>Loading...</div>
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
