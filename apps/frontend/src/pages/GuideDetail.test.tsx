import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import GuideDetail from './GuideDetail'
import BrewLogForm from './BrewLogForm'
import api from '../utils/api'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'

vi.mock('../utils/api', async () => {
    const actual = await vi.importActual<any>('../utils/api')
    return { __esModule: true, default: actual.default, api: actual.api, resetLogoutGuard: actual.resetLogoutGuard }
})

describe('GuideDetail', () => {
    it('renders guide detail with steps and back link', async () => {
        render(
            <MemoryRouter initialEntries={["/guides/v60"]}>
                <Routes>
                    <Route path="/guides/:slug" element={<GuideDetail />} />
                </Routes>
            </MemoryRouter>
        )

        expect(await screen.findByTestId('guide-detail-title')).toHaveTextContent(/v60/i)
        const steps = await screen.findAllByTestId('guide-step')
        expect(steps.length).toBeGreaterThanOrEqual(3)
        const back = screen.getAllByTestId('back-to-guides')[0]
        expect(back).toHaveAttribute('href', '/guides')
        // Ensure images have alt text
        const imgs = screen.getAllByRole('img')
        imgs.forEach((img) => expect(img).toHaveAttribute('alt'))
    })

    it('renders Not Found for unknown slug', async () => {
        render(
            <MemoryRouter initialEntries={["/guides/unknown"]}>
                <Routes>
                    <Route path="/guides/:slug" element={<GuideDetail />} />
                </Routes>
            </MemoryRouter>
        )

        expect(await screen.findByTestId('not-found')).toBeInTheDocument()
        const back = screen.getAllByTestId('back-to-guides')[0]
        expect(back).toHaveAttribute('href', '/guides')
    })

    it('CTA navigates to brew log with prefilled params', async () => {
        const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { coffees: [ { id: 1, name: 'House Blend' } ] } })
        render(
            <MemoryRouter initialEntries={["/guides/v60"]}>
                <Routes>
                    <Route path="/guides/:slug" element={<GuideDetail />} />
                    <Route path="/brew-logs/new" element={<BrewLogForm />} />
                </Routes>
            </MemoryRouter>
        )

        fireEvent.click(await screen.findByTestId('start-brewing'))
        // On navigation, prefill note should appear and brew method should be set from guide
        expect(await screen.findByTestId('prefill-note')).toBeInTheDocument()
        await waitFor(() => expect((screen.getByTestId('brew-method') as HTMLInputElement).value).toMatch(/v60/i))
        // Coffee not selected yet: expect select present; choose one
        const trigger = await screen.findByRole('combobox', { name: /select coffee/i })
        fireEvent.mouseDown(trigger)
        const option = await screen.findByRole('option', { name: /house blend/i })
        fireEvent.click(option)
        getSpy.mockRestore()
    })

})

    it('unauthenticated user is redirected to login with preserved prefill state', async () => {
        const LoginStub = () => {
            const loc = require('react-router-dom').useLocation()
            const preserved = (loc.state as any)?.fromState?.initialBrewParams
            return <div>
                <h4>Login</h4>
                <div data-testid="preserved-brew-method">{preserved?.brewMethod}</div>
            </div>
        }

        render(
            <MemoryRouter initialEntries={["/guides/v60"]}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginStub />} />
                        <Route path="/guides/:slug" element={<GuideDetail />} />
                        <Route path="/brew-logs/new" element={<ProtectedRoute><BrewLogForm /></ProtectedRoute>} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        )

        const cta = await screen.findByTestId('start-brewing')
        fireEvent.click(cta)
        expect(await screen.findByText('Login')).toBeInTheDocument()
        expect(screen.getByTestId('preserved-brew-method')).toHaveTextContent(/v60/i)
    })
