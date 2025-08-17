import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Container, Box } from '@mui/material'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import Dashboard from './pages/Dashboard'
import CoffeeListPage from './pages/CoffeeListPage'
import CoffeeDetailPage from './pages/CoffeeDetailPage'
import BrewLogForm from './pages/BrewLogForm'
import UserProfilePage from './pages/UserProfilePage'
import { AuthProvider } from './context/AuthContext'

function App() {
    return (
        <AuthProvider>
            <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
                <Header />
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />

                        {/* Protected routes */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/coffees" element={<CoffeeListPage />} />
                        <Route path="/coffees/:id" element={<CoffeeDetailPage />} />
                        <Route path="/brew-logs/new" element={<BrewLogForm />} />
                        <Route path="/brew-logs/:id" element={<BrewLogForm />} />
                        <Route path="/profile" element={<UserProfilePage />} />
                    </Routes>
                </Container>
            </Box>
        </AuthProvider>
    )
}

export default App
