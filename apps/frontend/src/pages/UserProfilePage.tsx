import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const UserProfilePage: React.FC = () => {
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                User Profile
            </Typography>
            <Paper sx={{ p: 4 }}>
                <Typography variant="body1">
                    User profile page will be implemented here.
                </Typography>
            </Paper>
        </Box>
    )
}

export default UserProfilePage
