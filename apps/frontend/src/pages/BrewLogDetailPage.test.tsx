import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BrewLogDetailPage from './BrewLogDetailPage'
import api from '../utils/api'

vi.mock('../utils/api', async () => {
  const actual = await vi.importActual<any>('../utils/api')
  return { __esModule: true, default: actual.default, api: actual.api }
})

const sample = {
  id: 42,
  userId: 1,
  coffeeId: 1,
  brewMethod: 'V60',
  coffeeWeight: 15,
  waterWeight: 250,
  grindSize: 'Medium-fine',
  waterTemperature: 92,
  brewTime: 180,
  tastingNotes: 'Sweet and floral',
  rating: 4,
  createdAt: '2024-08-02T10:00:00Z',
}

describe('BrewLogDetailPage', () => {
  it('renders details and edits successfully', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: sample })
    const putSpy = vi.spyOn(api, 'put').mockResolvedValueOnce({ data: { ...sample, brewMethod: 'Espresso' } })

    render(
      <MemoryRouter initialEntries={[`/brew-logs/${sample.id}`]}>
        <Routes>
          <Route path="/brew-logs/:id" element={<BrewLogDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(getSpy).toHaveBeenCalled())
    expect(await screen.findByTestId('brewlog-detail')).toBeInTheDocument()
    expect((screen.getByTestId('brew-method') as HTMLInputElement).value).toBe('V60')

    fireEvent.click(screen.getByTestId('edit-button'))
    const methodInput = await screen.findByTestId('brew-method')
    fireEvent.change(methodInput, { target: { value: 'Espresso' } })
    fireEvent.click(screen.getByTestId('save-edit'))

    await waitFor(() => expect(putSpy).toHaveBeenCalled())

    getSpy.mockRestore()
    putSpy.mockRestore()
  })

  it('does not send PUT on Update click; only on Save', async () => {
    const sample2 = { ...sample, id: 77, coffeeId: 2 }
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: sample2 })
    const putSpy = vi.spyOn(api, 'put').mockResolvedValue({ data: sample })

    render(
      <MemoryRouter initialEntries={[`/brew-logs/${sample2.id}`]}>
        <Routes>
          <Route path="/brew-logs/:id" element={<BrewLogDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Wait for details to render then enter edit mode
    expect(await screen.findByTestId('brew-method')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('edit-button'))

    // Ensure no PUT yet just by entering edit mode
    await waitFor(() => expect(putSpy).not.toHaveBeenCalled())

    // Make a change and save
    const methodInput = await screen.findByTestId('brew-method')
    fireEvent.change(methodInput, { target: { value: 'Espresso' } })
    fireEvent.click(screen.getByTestId('save-edit'))

    await waitFor(() => expect(putSpy).toHaveBeenCalled())

    putSpy.mockRestore()
  })

  it('handles 404 with friendly message', async () => {
    const getSpy = vi.spyOn(api, 'get').mockRejectedValueOnce({ response: { status: 404, data: { message: 'brew log not found' } } })

    render(
      <MemoryRouter initialEntries={[`/brew-logs/999`]}>
        <Routes>
          <Route path="/brew-logs/:id" element={<BrewLogDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(() => expect(getSpy).toHaveBeenCalled())
    expect(await screen.findByTestId('error-404')).toBeInTheDocument()
    getSpy.mockRestore()
  })
})
