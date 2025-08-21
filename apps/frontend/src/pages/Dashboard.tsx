import React from 'react'
import { Box, Typography, Paper, Stack, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const Dashboard: React.FC = () => {
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Stack spacing={3}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Quick Actions
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            component={RouterLink}
                            to="/coffees/new"
                        >
                            Add New Coffee
                        </Button>
                    </Stack>
                </Paper>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="body1">
                        Dashboard content will be implemented here.
                    </Typography>
                </Paper>
            </Stack>
        </Box>
    )
}

export default Dashboard
