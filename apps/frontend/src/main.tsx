import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'

// Create a coffee-themed Material-UI theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#8B4513', // Saddle brown - coffee color
        },
        secondary: {
            main: '#D2691E', // Chocolate - warm accent
        },
        background: {
            default: '#FAFAFA',
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 300,
        },
        h2: {
            fontWeight: 300,
        },
        h3: {
            fontWeight: 400,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
            },
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>,
)
