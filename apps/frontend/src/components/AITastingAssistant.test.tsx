import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AITastingAssistant from './AITastingAssistant'
import api from '../utils/api'

vi.mock('../utils/api', async () => {
    const actual = await vi.importActual<any>('../utils/api')
    return { __esModule: true, default: actual.default, api: actual.api }
})

describe('AITastingAssistant', () => {
    afterEach(() => vi.restoreAllMocks())

    it('walks through one step and finishes with composed notes', async () => {
        const post = vi.spyOn(api, 'post')
            .mockResolvedValueOnce({ data: { questionId: 'q1', text: 'Pick aroma', options: [ { label: 'Floral', value: 'floral' }, { label: 'Nutty', value: 'nutty' } ] } })

        const onComplete = vi.fn()
        render(
            <AITastingAssistant open brewMethod="V60" onClose={() => {}} onComplete={onComplete} />
        )

        expect(await screen.findByTestId('ai-guide')).toBeInTheDocument()
        expect(await screen.findByTestId('ai-question')).toHaveTextContent('Pick aroma')

        const options = screen.getAllByTestId('ai-option')
        fireEvent.click(options[0]) // Floral

        fireEvent.click(screen.getByTestId('ai-finish'))

        await waitFor(() => expect(onComplete).toHaveBeenCalledWith('Floral'))
        post.mockRestore()
    })

    it('shows error and allows retry', async () => {
        const post = vi.spyOn(api, 'post')
            .mockRejectedValueOnce({ response: { status: 502, data: { message: 'Upstream down' } } })
            .mockResolvedValueOnce({ data: { questionId: 'q1', text: 'Pick aroma', options: [ { label: 'Floral', value: 'floral' } ] } })

        render(
            <AITastingAssistant open brewMethod="V60" onClose={() => {}} onComplete={() => {}} />
        )

        expect(await screen.findByText(/provider error/i)).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('ai-retry'))
        expect(await screen.findByTestId('ai-question')).toHaveTextContent('Pick aroma')
        post.mockRestore()
    })
})

