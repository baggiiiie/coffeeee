import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import UserProfilePage from './UserProfilePage'

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockUseAuth = vi.mocked(await import('../context/AuthContext')).useAuth

describe('UserProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits profile update and shows success', async () => {
    const updateProfile = vi.fn().mockResolvedValue({})
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'alice', email: 'alice@example.com', createdAt: '', updatedAt: '' },
      token: 't',
      isAuthenticated: true,
      isBootstrapping: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateProfile,
    } as any)

    render(
      <BrowserRouter>
        <UserProfilePage />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'alice_new' } })
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ username: 'alice_new' }))
    expect(screen.getByText('Profile updated successfully')).toBeInTheDocument()
  })
})

