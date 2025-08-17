import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const Dashboard: React.FC = () => {
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Paper sx={{ p: 4 }}>
                <Typography variant="body1">
                    Dashboard content will be implemented here.
                </Typography>
            </Paper>
        </Box>
    )
}

export default Dashboard
