import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const LoginPage: React.FC = () => {
    return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Login Page
            </Typography>
            <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
                <Typography variant="body1">
                    Login form will be implemented here.
                </Typography>
            </Paper>
        </Box>
    )
}

export default LoginPage
