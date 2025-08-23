import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import BrewingGuidesPage from './BrewingGuidesPage'

describe('BrewingGuidesPage', () => {
    it('renders guides list and navigates to detail on click', async () => {
        render(
            <MemoryRouter initialEntries={["/guides"]}>
                <Routes>
                    <Route path="/guides" element={<BrewingGuidesPage />} />
                    <Route path="/guides/:slug" element={<div data-testid="detail">Detail</div>} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByTestId('guides-list')).toBeInTheDocument()
        const cards = await screen.findAllByTestId('guide-card')
        expect(cards.length).toBeGreaterThanOrEqual(2)

        // Click the first card
        const firstAction = cards[0].querySelector('button') as HTMLButtonElement
        fireEvent.click(firstAction)
        expect(await screen.findByTestId('detail')).toBeInTheDocument()
    })
})

