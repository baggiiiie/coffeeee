import React from 'react'
import { Box, Typography, Paper, Button } from '@mui/material'
import { useParams, Link as RouterLink } from 'react-router-dom'

const CoffeeDetailPage: React.FC = () => {
    const { id } = useParams()
    const coffeeId = id ?? ''
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Coffee Detail
            </Typography>
            <Paper sx={{ p: 4, mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                    Coffee detail page will be implemented here.
                </Typography>
                {coffeeId && (
                    <Button
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to={`/brew-logs/new?coffeeId=${coffeeId}`}
                        data-testid="log-new-brew"
                    >
                        Log New Brew
                    </Button>
                )}
            </Paper>
        </Box>
    )
}

export default CoffeeDetailPage
