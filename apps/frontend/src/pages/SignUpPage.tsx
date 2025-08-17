import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const SignUpPage: React.FC = () => {
    return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Sign Up Page
            </Typography>
            <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
                <Typography variant="body1">
                    Sign up form will be implemented here.
                </Typography>
            </Paper>
        </Box>
    )
}

export default SignUpPage
