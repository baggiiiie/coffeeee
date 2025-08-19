import React, { useState } from 'react'
import { Box, Typography, Paper, TextField, Button, Alert, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const SignUpPage: React.FC = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setSubmitting(true)
        try {
            const res = await fetch('/api/v1/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            if (res.ok) {
                setSuccess('Account created successfully. Redirecting to login...')
                setTimeout(() => navigate('/login'), 600)
            } else if (res.status === 409) {
                setError('Email is already in use.')
            } else {
                const text = await res.text()
                setError(text || 'Registration failed')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Create an Account
            </Typography>
            <Paper sx={{ p: 4, maxWidth: 420, mx: 'auto' }}>
                <form onSubmit={onSubmit}>
                    <Stack spacing={2}>
                        {error && <Alert severity="error" role="alert">{error}</Alert>}
                        {success && <Alert severity="success" role="status">{success}</Alert>}
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            fullWidth
                        />
                        <Button type="submit" variant="contained" disabled={submitting}>
                            {submitting ? 'Signing up...' : 'Sign Up'}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Box>
    )
}

export default SignUpPage
