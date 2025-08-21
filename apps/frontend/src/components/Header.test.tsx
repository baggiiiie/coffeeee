import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('Header Logout', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('clears authToken and redirects to /login on Logout click', async () => {
        localStorage.setItem('authToken', 'test-token')
        const user = userEvent.setup()

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <App />
            </MemoryRouter>
        )

        // Ensure Logout button is visible for authenticated user
        const logoutBtn = await screen.findByRole('button', { name: /logout/i })
        await user.click(logoutBtn)

        // Token cleared
        expect(localStorage.getItem('authToken')).toBeNull()

        // Redirected to login page (by checking heading text)
        expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument()
    })
})

