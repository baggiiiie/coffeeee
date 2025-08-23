import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import GuideDetail from './GuideDetail'

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
})

