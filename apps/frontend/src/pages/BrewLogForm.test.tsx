import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BrewLogForm from './BrewLogForm'
import api from '../utils/api'

vi.mock('../utils/api', async () => {
    const actual = await vi.importActual<any>('../utils/api')
    return { __esModule: true, default: actual.default, api: actual.api }
})

describe('BrewLogForm', () => {
    it('validates and submits brew log then redirects', async () => {
        const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { id: 1 } })
        render(
            <MemoryRouter initialEntries={["/brew-logs/new?coffeeId=42"]}>
                <Routes>
                    <Route path="/brew-logs/new" element={<BrewLogForm />} />
                    <Route path="/coffees/:id" element={<div data-testid="coffee-detail">Detail</div>} />
                </Routes>
            </MemoryRouter>
        )
        // Initially disabled until brew method selected
        const submit = screen.getByTestId('submit-brewlog')
        expect(submit).toBeDisabled()

        fireEvent.change(screen.getByTestId('brew-method'), { target: { value: 'V60' } })

        fireEvent.change(screen.getByTestId('coffee-weight'), { target: { value: '15' } })
        fireEvent.change(screen.getByTestId('water-weight'), { target: { value: '250' } })

        expect(screen.getByText(/log new brew/i)).toBeInTheDocument()
        expect(submit).not.toBeDisabled()

        fireEvent.click(submit)
        await waitFor(() => expect(postSpy).toHaveBeenCalledWith('/api/v1/brewlogs', expect.objectContaining({ coffeeId: 42, brewMethod: 'V60' })))
        await waitFor(() => expect(screen.getByTestId('coffee-detail')).toBeInTheDocument())
        postSpy.mockRestore()
    })
})
