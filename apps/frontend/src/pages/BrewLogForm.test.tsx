import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BrewLogForm from './BrewLogForm'
import api from '../utils/api'

vi.mock('../utils/api', async () => {
    const actual = await vi.importActual<any>('../utils/api')
    return { __esModule: true, default: actual.default, api: actual.api }
})

describe('BrewLogForm', () => {
    it('opens AI guide and injects tasting notes on finish', async () => {
        const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { questionId: 'q1', text: 'Pick aroma', options: [ { label: 'Floral', value: 'floral' } ] } })
        render(
            <MemoryRouter initialEntries={["/brew-logs/new?coffeeId=42"]}>
                <Routes>
                    <Route path="/brew-logs/new" element={<BrewLogForm />} />
                </Routes>
            </MemoryRouter>
        )
        fireEvent.change(screen.getByTestId('brew-method'), { target: { value: 'V60' } })
        fireEvent.click(screen.getByTestId('open-ai-guide'))

        expect(await screen.findByTestId('ai-guide')).toBeInTheDocument()
        expect(await screen.findByTestId('ai-question')).toHaveTextContent('Pick aroma')
        fireEvent.click(screen.getAllByTestId('ai-option')[0])
        fireEvent.click(screen.getByTestId('ai-finish'))
        await waitFor(() => expect((screen.getByTestId('tasting-notes') as HTMLInputElement).value).toContain('Floral'))
        postSpy.mockRestore()
    })
    it('shows next-time recommendation CTA after successful save', async () => {
        const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { id: 1 } })
        render(
            <MemoryRouter initialEntries={["/brew-logs/new?coffeeId=42"]}>
                <Routes>
                    <Route path="/brew-logs/new" element={<BrewLogForm />} />
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
        await waitFor(() => expect(screen.getByTestId('next-reco-cta')).toBeInTheDocument())
        postSpy.mockRestore()
    })

    it('prefills fields from router state and allows reset', async () => {
        const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { coffees: [] } })
        render(
            <MemoryRouter initialEntries={[
                { pathname: '/brew-logs/new', state: { initialBrewParams: { brewMethod: 'Chemex', waterTemperature: 92, grindSize: 'medium' }, fromGuideTitle: 'Chemex Brewing Guide' } } as any,
            ]}>
                <Routes>
                    <Route path="/brew-logs/new" element={<BrewLogForm />} />
                </Routes>
            </MemoryRouter>
        )
        expect(await screen.findByTestId('prefill-note')).toBeInTheDocument()
        expect((screen.getByTestId('brew-method') as HTMLInputElement).value).toMatch(/chemex/i)
        // Change a field, then reset
        fireEvent.change(screen.getByTestId('brew-method'), { target: { value: 'V60' } })
        fireEvent.click(screen.getByRole('button', { name: /reset to defaults/i }))
        await waitFor(() => expect((screen.getByTestId('brew-method') as HTMLInputElement).value).toMatch(/chemex/i))
        getSpy.mockRestore()
    })

    it('requires selecting a coffee if none provided and blocks submit until chosen', async () => {
        const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { coffees: [ { id: 7, name: 'Ethiopia Yirgacheffe' } ] } })
        render(
            <MemoryRouter initialEntries={["/brew-logs/new"]}>
                <Routes>
                    <Route path="/brew-logs/new" element={<BrewLogForm />} />
                </Routes>
            </MemoryRouter>
        )
        fireEvent.change(screen.getByTestId('brew-method'), { target: { value: 'V60' } })
        const submit = screen.getByTestId('submit-brewlog')
        expect(submit).toBeDisabled()
        const trigger = await screen.findByRole('combobox', { name: /select coffee/i })
        fireEvent.mouseDown(trigger)
        const opt = await screen.findByRole('option', { name: /ethiopia yirgacheffe/i })
        fireEvent.click(opt)
        expect(submit).not.toBeDisabled()
        getSpy.mockRestore()
    })

    it('shows a friendly error when backend returns 403 for unauthorized coffee', async () => {
        const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { coffees: [ { id: 9, name: 'Kenya AA' } ] } })
        const postSpy = vi.spyOn(api, 'post').mockRejectedValueOnce({ response: { status: 403 } })
        render(
            <MemoryRouter initialEntries={["/brew-logs/new"]}>
                <Routes>
                    <Route path="/brew-logs/new" element={<BrewLogForm />} />
                </Routes>
            </MemoryRouter>
        )
        fireEvent.change(screen.getByTestId('brew-method'), { target: { value: 'Chemex' } })
        const trigger = await screen.findByRole('combobox', { name: /select coffee/i })
        fireEvent.mouseDown(trigger)
        const opt = await screen.findByRole('option', { name: /kenya aa/i })
        fireEvent.click(opt)
        fireEvent.click(screen.getByTestId('submit-brewlog'))
        expect(await screen.findByText(/only log brews for your own coffees/i)).toBeInTheDocument()
        getSpy.mockRestore(); postSpy.mockRestore()
    })
    it('opens recommendation dialog, submits goal, and renders result', async () => {
        // First call is saving brewlog; second call is AI recommendation
        const postSpy = vi.spyOn(api, 'post')
            .mockResolvedValueOnce({ data: { id: 1 } })
            .mockResolvedValueOnce({ data: { change: { variable: 'grind', delta: '2 clicks finer' }, explanation: 'Increase extraction for sweetness' } })

        render(
            <MemoryRouter initialEntries={["/brew-logs/new?coffeeId=42"]}>
                <Routes>
                    <Route path="/brew-logs/new" element={<BrewLogForm />} />
                </Routes>
            </MemoryRouter>
        )

        fireEvent.change(screen.getByTestId('brew-method'), { target: { value: 'V60' } })
        fireEvent.click(screen.getByTestId('submit-brewlog'))
        await waitFor(() => expect(postSpy).toHaveBeenCalledWith('/api/v1/brewlogs', expect.anything()))

        // Open dialog from CTA
        fireEvent.click(screen.getByRole('button', { name: /get a recommendation for next time/i }))
        expect(await screen.findByTestId('reco-dialog')).toBeInTheDocument()

        fireEvent.change(screen.getByTestId('reco-goal'), { target: { value: 'more sweetness' } })
        fireEvent.click(screen.getByTestId('reco-submit'))

        await waitFor(() => expect(screen.getByTestId('reco-result')).toBeInTheDocument())
        expect(screen.getByText(/2 clicks finer/i)).toBeInTheDocument()

        postSpy.mockRestore()
    })
})
