import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from 'react-router-dom'
import SignUpPage from './SignUpPage'

const theme = createTheme()

vi.mock('react-router-dom', async (orig) => {
    const actual = await (orig as any)()
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    }
})

describe('SignUpPage', () => {
    beforeEach(() => {
        // @ts-ignore
        global.fetch = vi.fn()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    const renderPage = () =>
        render(
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <SignUpPage />
                </BrowserRouter>
            </ThemeProvider>
        )

    it('submits and shows success', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({ ok: true, status: 201, text: async () => '' })

        renderPage()

        await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
        await userEvent.type(screen.getByLabelText(/password/i), 'secret123')
        await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

        await waitFor(() => {
            expect(screen.getByRole('status')).toHaveTextContent(/account created/i)
        })
    })
})

