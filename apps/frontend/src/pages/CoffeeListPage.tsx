import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const CoffeeListPage: React.FC = () => {
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Coffee List
            </Typography>
            <Paper sx={{ p: 4 }}>
                <Typography variant="body1">
                    Coffee list will be implemented here.
                </Typography>
            </Paper>
        </Box>
    )
}

export default CoffeeListPage
