import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, beforeEach, vi, expect } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import api from '../utils/api'

// Spy on the API instance
const mockApi = api as any

// Spy-friendly localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
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
        vi.restoreAllMocks()
        localStorageMock.getItem.mockReset()
        localStorageMock.setItem.mockReset()
        localStorageMock.removeItem.mockReset()
    })

    it('should hydrate user data when token exists in localStorage', async () => {
        // Mock token in localStorage
        localStorageMock.getItem.mockImplementation((key: string) => {
            if (key === 'authToken') return 'valid-token'
            return null
        })

        // Mock successful API response
        vi.spyOn(mockApi, 'get').mockResolvedValue({
            data: {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z'
            }
        } as any)

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        )

        // Wait for hydration to complete and auth to be set
        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
        })
        expect(screen.getByTestId('user-id')).toHaveTextContent('1')
        expect(screen.getByTestId('user-username')).toHaveTextContent('testuser')
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
        vi.spyOn(mockApi, 'get').mockRejectedValue(error as any)

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        )

        // Should not be authenticated
        await waitFor(() => expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false'))
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user')
        expect(screen.getByTestId('user-username')).toHaveTextContent('no-username')

        // Should have cleared the token
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken')
    })

    it('should not hydrate when no token exists', async () => {
        // Mock no token in localStorage
        localStorageMock.getItem.mockReturnValue(null)

        // Spy to ensure no API calls are made
        const getSpy = vi.spyOn(mockApi, 'get')

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        )

        // Should not be authenticated
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user')

        // Should not have called the API
        expect(getSpy).not.toHaveBeenCalled()
    })

    it('should migrate legacy token key', async () => {
        // Mock legacy token in localStorage
        localStorageMock.getItem.mockImplementation((key: string) => {
            if (key === 'token') return 'legacy-token'
            if (key === 'authToken') return null
            return null
        })

        // Mock successful API response
        vi.spyOn(mockApi, 'get').mockResolvedValue({
            data: {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z'
            }
        } as any)

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        )
        
        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
        })

        // Should have migrated the token
        expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'legacy-token')
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')

        // Should be authenticated
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
    })
})
