import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CoffeeNewPage from './CoffeeNewPage'
import { MemoryRouter } from 'react-router-dom'
import api from '../utils/api'

vi.mock('../utils/api', async () => {
    const actual = await vi.importActual<any>('../utils/api')
    return { __esModule: true, default: actual.default, api: actual.api }
})

describe('CoffeeNewPage', () => {
    it('renders fields and validates name', async () => {
        render(
            <MemoryRouter>
                <CoffeeNewPage />
            </MemoryRouter>
        )
        const submit = screen.getByTestId('submit-new-coffee')
        fireEvent.click(submit)
        await waitFor(() => {
            // API should not be called on validation error
            const spy = vi.spyOn(api, 'post')
            expect(spy).not.toHaveBeenCalled()
            spy.mockRestore()
        })
    })

    it('submits successfully with required fields', async () => {
        const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { id: 1 } })
        render(
            <MemoryRouter>
                <CoffeeNewPage />
            </MemoryRouter>
        )
        fireEvent.change(screen.getByTestId('coffee-name'), { target: { value: 'Test Coffee' } })
        fireEvent.click(screen.getByTestId('submit-new-coffee'))
        await waitFor(() => {
            expect(postSpy).toHaveBeenCalledWith('/api/v1/users/me/coffees', expect.objectContaining({ name: 'Test Coffee' }))
        })
        postSpy.mockRestore()
    })
})

