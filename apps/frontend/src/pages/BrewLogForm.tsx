import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const BrewLogForm: React.FC = () => {
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Brew Log Form
            </Typography>
            <Paper sx={{ p: 4 }}>
                <Typography variant="body1">
                    Brew log form will be implemented here.
                </Typography>
            </Paper>
        </Box>
    )
}

export default BrewLogForm
