import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Local type definitions (will be replaced with shared-types later)
interface User {
    id: number;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
}

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Load token from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('token')
        if (savedToken) {
            setToken(savedToken)
            setIsAuthenticated(true)
            // TODO: Validate token and load user data
        }
    }, [])

    const login = async (email: string, password: string) => {
        try {
            // TODO: Implement actual API call
            console.log('Login attempt:', { email, password })

            // Mock successful login
            const mockUser: User = {
                id: 1,
                username: 'testuser',
                email: email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            const mockToken = 'mock-jwt-token'

            setUser(mockUser)
            setToken(mockToken)
            setIsAuthenticated(true)
            localStorage.setItem('token', mockToken)
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        setIsAuthenticated(false)
        localStorage.removeItem('token')
    }

    const register = async (userData: CreateUserRequest) => {
        try {
            // TODO: Implement actual API call
            console.log('Register attempt:', userData)

            // Mock successful registration
            const mockUser: User = {
                id: 1,
                username: userData.username,
                email: userData.email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            const mockToken = 'mock-jwt-token'

            setUser(mockUser)
            setToken(mockToken)
            setIsAuthenticated(true)
            localStorage.setItem('token', mockToken)
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
