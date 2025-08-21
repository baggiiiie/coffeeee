import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import api from '../utils/api'

// Mock the API module
jest.mock('../utils/api')
const mockApi = api as jest.Mocked<typeof api>

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

// Test component to access auth context
const TestComponent = () => {
    const { user, isAuthenticated } = useAuth()
    return (
        <div>
            <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="user-id">{user?.id || 'no-user'}</div>
            <div data-testid="user-username">{user?.username || 'no-username'}</div>
        </div>
    )
}

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.getItem.mockClear()
        localStorageMock.setItem.mockClear()
        localStorageMock.removeItem.mockClear()
    })

    it('should hydrate user data when token exists in localStorage', async () => {
        // Mock token in localStorage
        localStorageMock.getItem.mockImplementation((key: string) => {
            if (key === 'authToken') return 'valid-token'
            return null
        })

        // Mock successful API response
        mockApi.get.mockResolvedValue({
            data: {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z'
            }
        } as any)

        render(
            <BrowserRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </BrowserRouter>
        )

        // Should show loading initially
        expect(screen.getByText('Loading...')).toBeInTheDocument()

        // Wait for hydration to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        })

        // Should be authenticated
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
        expect(screen.getByTestId('user-id')).toHaveTextContent('1')
        expect(screen.getByTestId('user-username')).toHaveTextContent('testuser')

        // Should have called the API with correct endpoint
        expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/me')
    })

    it('should clear token and remain unauthenticated when hydration fails with 401', async () => {
        // Mock token in localStorage
        localStorageMock.getItem.mockImplementation((key: string) => {
            if (key === 'authToken') return 'invalid-token'
            return null
        })

        // Mock 401 API response
        const error = new Error('Unauthorized')
            ; (error as any).response = { status: 401 }
        mockApi.get.mockRejectedValue(error)

        render(
            <BrowserRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </BrowserRouter>
        )

        // Wait for hydration to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        })

        // Should not be authenticated
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user')
        expect(screen.getByTestId('user-username')).toHaveTextContent('no-username')

        // Should have cleared the token
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken')
    })

    it('should not hydrate when no token exists', async () => {
        // Mock no token in localStorage
        localStorageMock.getItem.mockReturnValue(null)

        render(
            <BrowserRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </BrowserRouter>
        )

        // Wait for hydration to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        })

        // Should not be authenticated
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user')

        // Should not have called the API
        expect(mockApi.get).not.toHaveBeenCalled()
    })

    it('should migrate legacy token key', async () => {
        // Mock legacy token in localStorage
        localStorageMock.getItem.mockImplementation((key: string) => {
            if (key === 'token') return 'legacy-token'
            if (key === 'authToken') return null
            return null
        })

        // Mock successful API response
        mockApi.get.mockResolvedValue({
            data: {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z'
            }
        } as any)

        render(
            <BrowserRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </BrowserRouter>
        )

        // Wait for hydration to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        })

        // Should have migrated the token
        expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'legacy-token')
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')

        // Should be authenticated
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
    })
})
