import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'

const theme = createTheme()

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>{ui}</BrowserRouter>
        </ThemeProvider>
    )
}

describe('App', () => {
    it('renders landing page content', () => {
        renderWithProviders(<App />)
        expect(
            screen.getByRole('heading', { name: /welcome to coffeeee/i })
        ).toBeInTheDocument()
    })
})

