import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CoffeeDetailPage from './CoffeeDetailPage'
import api from '../utils/api'

vi.mock('../utils/api', async () => {
    const actual = await vi.importActual<any>('../utils/api')
    return { __esModule: true, default: actual.default, api: actual.api }
})

describe('CoffeeDetailPage BrewLogList', () => {
    it('renders list with items from API and navigates on click', async () => {
        const items = { brewLogs: [ { id: 11, createdAt: '2024-08-02T10:00:00Z', brewMethod: 'V60', tastingNotes: 'Nice and sweet' }, { id: 10, createdAt: '2024-08-01T10:00:00Z', brewMethod: 'Espresso', tastingNotes: 'Fruity\nSecond line' } ] }
        const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: items })

        render(
            <MemoryRouter initialEntries={["/coffees/1"]}>
                <Routes>
                    <Route path="/coffees/:id" element={<CoffeeDetailPage />} />
                    <Route path="/brew-logs/:id" element={<div data-testid="detail">Detail</div>} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            const calls = getSpy.mock.calls.map((c) => c[0])
            expect(calls).toContain('/api/v1/brewlogs?coffeeId=1&limit=20&offset=0')
        })
        const list = await screen.findByTestId('brewlog-list')
        expect(list).toBeInTheDocument()
        const itemsEls = await screen.findAllByTestId('brewlog-item')
        expect(itemsEls.length).toBe(2)
        // Ensure brew methods are rendered alongside dates
        expect(screen.getByText(/V60/)).toBeInTheDocument()
        expect(screen.getByText(/Espresso/)).toBeInTheDocument()
        fireEvent.click(itemsEls[0])
        expect(await screen.findByTestId('detail')).toBeInTheDocument()
        getSpy.mockRestore()
    })

    it('shows empty state when no logs', async () => {
        const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { brewLogs: [] } })
        render(
            <MemoryRouter initialEntries={["/coffees/1"]}>
                <Routes>
                    <Route path="/coffees/:id" element={<CoffeeDetailPage />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => expect(getSpy).toHaveBeenCalled())
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
        getSpy.mockRestore()
    })

    it('shows error state with retry on failure', async () => {
        const getSpy = vi.spyOn(api, 'get').mockRejectedValueOnce({ response: { data: { message: 'oops' } } })
        render(
            <MemoryRouter initialEntries={["/coffees/1"]}>
                <Routes>
                    <Route path="/coffees/:id" element={<CoffeeDetailPage />} />
                </Routes>
            </MemoryRouter>
        )
        await waitFor(() => expect(getSpy).toHaveBeenCalled())
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
        getSpy.mockRestore()
    })
})
