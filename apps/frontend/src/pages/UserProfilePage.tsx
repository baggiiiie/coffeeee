import React, { useState } from 'react'
import { Box, Typography, Alert } from '@mui/material'
import ProfileForm from '../components/ProfileForm'
import { useAuth } from '../context/AuthContext'

const UserProfilePage: React.FC = () => {
    const { user, updateProfile } = useAuth()
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    if (!user) return null

    const handleSubmit = async (values: Partial<{ username: string; email: string }>) => {
        setSuccess('')
        setError('')
        try {
            await updateProfile(values)
            setSuccess('Profile updated successfully')
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Failed to update profile'
            setError(msg)
        }
    }

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                User Profile
            </Typography>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <ProfileForm initialValues={{ username: user.username, email: user.email }} onSubmit={handleSubmit} />
        </Box>
    )
}

export default UserProfilePage
