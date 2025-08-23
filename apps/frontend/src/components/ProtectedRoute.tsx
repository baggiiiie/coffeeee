import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isBootstrapping } = useAuth()
    const location = useLocation()

    if (isBootstrapping) {
        return <div>Loading...</div>
    }

    if (!isAuthenticated) {
        // Redirect to login page with explicit return info
        const fromPath = location.pathname + location.search + location.hash
        const fromState = location.state
        return <Navigate to="/login" state={{ fromPath, fromState }} replace />
    }

    return <>{children}</>
}

export default ProtectedRoute
