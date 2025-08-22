import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
    it('shows My Coffees link', async () => {
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        )
        expect(screen.getByTestId('my-coffees-link')).toBeInTheDocument()
    })
})

