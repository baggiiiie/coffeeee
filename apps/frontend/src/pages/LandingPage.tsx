import React from 'react'
import { Box, Typography, Button, Container, Paper } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const LandingPage: React.FC = () => {
    return (
        <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Welcome to Coffee Companion
                </Typography>

                <Typography variant="h5" color="text.secondary" paragraph>
                    Track your coffee journey, log your brews, and discover new flavors with AI-powered recommendations.
                </Typography>

                <Paper sx={{ p: 4, my: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Features
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="body1">☕ Coffee Logging</Typography>
                        <Typography variant="body1">📝 Brew Logs</Typography>
                        <Typography variant="body1">🤖 AI Recommendations</Typography>
                        <Typography variant="body1">📚 Brewing Guides</Typography>
                    </Box>
                </Paper>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        size="large"
                        component={RouterLink}
                        to="/signup"
                    >
                        Get Started
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        component={RouterLink}
                        to="/login"
                    >
                        Sign In
                    </Button>
                </Box>
            </Box>
        </Container>
    )
}

export default LandingPage
