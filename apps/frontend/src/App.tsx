import { Routes, Route } from 'react-router-dom'
import { Container, Box } from '@mui/material'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import Dashboard from './pages/Dashboard'
import CoffeeListPage from './pages/CoffeeListPage'
import CoffeeDetailPage from './pages/CoffeeDetailPage'
import CoffeeNewPage from './pages/CoffeeNewPage'
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
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/coffees" element={
                            <ProtectedRoute>
                                <CoffeeListPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/coffees/new" element={
                            <ProtectedRoute>
                                <CoffeeNewPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/coffees/:id" element={
                            <ProtectedRoute>
                                <CoffeeDetailPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/brew-logs/new" element={
                            <ProtectedRoute>
                                <BrewLogForm />
                            </ProtectedRoute>
                        } />
                        <Route path="/brew-logs/:id" element={
                            <ProtectedRoute>
                                <BrewLogForm />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <UserProfilePage />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Container>
            </Box>
        </AuthProvider>
    )
}

export default App
