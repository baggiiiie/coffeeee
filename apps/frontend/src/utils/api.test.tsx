import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import api from './api'

describe('Axios 401 auto-logout interceptor', () => {
    const originalAdapter = api.defaults.adapter

    beforeEach(() => {
        localStorage.clear()
        // Set user as authenticated
        localStorage.setItem('authToken', 'test-token')
    })

    afterEach(() => {
        // restore adapter
        api.defaults.adapter = originalAdapter
    })

    it('dispatches logout and redirects to /login on 401', async () => {
        // Mock adapter to simulate a 401 response
        api.defaults.adapter = (config) => {
            return Promise.reject({ response: { status: 401 } } as any)
        }

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <App />
            </MemoryRouter>
        )

        // Trigger any request; interceptor should catch 401 and emit logout event
        try {
            await api.get('/test')
        } catch (_) {
            // ignore
        }

        await waitFor(async () => {
            expect(localStorage.getItem('authToken')).toBeNull()
            expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument()
        })
    })
})

