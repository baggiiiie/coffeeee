import React, { useEffect, useState } from 'react'
import { Box, Typography, Grid, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const CoffeeListPage: React.FC = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [coffees, setCoffees] = useState<any[]>([])

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const res = await api.get('/api/v1/users/me/coffees')
                if (!mounted) return
                setCoffees(res.data?.coffees ?? [])
            } catch (err: any) {
                const msg = err?.response?.data?.message || 'Failed to load coffees'
                setError(msg)
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => { mounted = false }
    }, [])

    const onCardClick = (id: number) => navigate(`/coffees/${id}`)

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Coffees
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : coffees.length === 0 ? (
                <Alert severity="info">You have not added any coffees yet.</Alert>
            ) : (
                <Grid container spacing={2} data-testid="grid">
                    {coffees.map((c) => (
                        <Grid item key={c.id} xs={12} sm={6} md={4} lg={3}>
                            <Card data-testid="card">
                                <CardActionArea onClick={() => onCardClick(c.id)}>
                                    {c.photoPath ? (
                                        <CardMedia component="img" height="160" image={c.photoPath} alt={c.name} />
                                    ) : (
                                        <Box sx={{ height: 160, bgcolor: 'grey.200' }} />
                                    )}
                                    <CardContent>
                                        <Typography data-testid="card-title" variant="subtitle1" noWrap>
                                            {c.name}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    )
}

export default CoffeeListPage
