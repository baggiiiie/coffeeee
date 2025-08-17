import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const CoffeeDetailPage: React.FC = () => {
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Coffee Detail
            </Typography>
            <Paper sx={{ p: 4 }}>
                <Typography variant="body1">
                    Coffee detail page will be implemented here.
                </Typography>
            </Paper>
        </Box>
    )
}

export default CoffeeDetailPage
