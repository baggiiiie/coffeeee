import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header: React.FC = () => {
    const { isAuthenticated, logout } = useAuth()

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={RouterLink} to="/" sx={{
                    flexGrow: 1,
                    textDecoration: 'none',
                    color: 'inherit'
                }}>
                    Coffee Companion
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {isAuthenticated ? (
                        <>
                            <Button color="inherit" component={RouterLink} to="/dashboard">
                                Dashboard
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/coffees">
                                Coffees
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/profile">
                                Profile
                            </Button>
                            <Button
                                color="inherit"
                                onClick={() => logout({ reason: 'manual' })}
                                data-testid="logout-button"
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={RouterLink} to="/login">
                                Login
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/signup">
                                Sign Up
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default Header
