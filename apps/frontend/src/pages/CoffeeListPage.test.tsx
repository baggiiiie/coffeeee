import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CoffeeListPage from './CoffeeListPage'
import api from '../utils/api'

vi.mock('../utils/api', async () => {
    const actual = await vi.importActual<any>('../utils/api')
    return { __esModule: true, default: actual.default, api: actual.api }
})

describe('CoffeeListPage', () => {
    it('renders grid with coffees from API and navigates on click', async () => {
        const items = { coffees: [ { id: 1, name: 'Alpha' }, { id: 2, name: 'Beta', photoPath: '/static/p.jpg' } ] }
        const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: items })

        render(
            <MemoryRouter initialEntries={["/coffees"]}>
                <Routes>
                    <Route path="/coffees" element={<CoffeeListPage />} />
                    <Route path="/coffees/:id" element={<div data-testid="detail">Detail</div>} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => expect(getSpy).toHaveBeenCalledWith('/api/v1/coffees'))
        expect(await screen.findByTestId('grid')).toBeInTheDocument()
        const cards = await screen.findAllByTestId('card')
        expect(cards.length).toBe(2)
        const firstButton = cards[0].querySelector('button') as HTMLButtonElement
        fireEvent.click(firstButton)
        expect(await screen.findByTestId('detail')).toBeInTheDocument()
        getSpy.mockRestore()
    })

    it('shows empty state when no coffees', async () => {
        const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { coffees: [] } })
        render(
            <MemoryRouter>
                <CoffeeListPage />
            </MemoryRouter>
        )
        await waitFor(() => expect(getSpy).toHaveBeenCalled())
        expect(screen.getByText(/not added any coffees/i)).toBeInTheDocument()
        getSpy.mockRestore()
    })
})
