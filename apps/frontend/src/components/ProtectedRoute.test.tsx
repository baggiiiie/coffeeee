import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('ProtectedRoute', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('redirects unauthenticated users to /login', async () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <App />
            </MemoryRouter>
        )

        // Should land on Login page
        expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument()
    })
})

