import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Paper, Button, Alert, Stack, List, ListItemButton, ListItemText, CircularProgress } from '@mui/material'
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { getWithCache } from '../utils/fetchCache'
import { useCachedGet } from '../hooks/useCachedGet'

type BrewLog = {
    id: number
    createdAt: string
    brewMethod: string
    coffeeWeight?: number
    waterWeight?: number
    rating?: number
    tastingNotes?: string
}

const BrewLogList: React.FC<{ coffeeId: number }> = ({ coffeeId }) => {
    const navigate = useNavigate()
    const [items, setItems] = useState<BrewLog[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const limit = 20

    const load = async (reset = false, signal?: AbortSignal) => {
        setLoading(true)
        setError(null)
        try {
            const res = await getWithCache(`/api/v1/brewlogs?coffeeId=${coffeeId}&limit=${limit}&offset=${reset ? 0 : offset}`, { signal, ttlMs: 15000 })
            const page: BrewLog[] = res.data?.brewLogs ?? []
            setItems((prev) => (reset ? page : [...prev, ...page]))
            setHasMore(page.length === limit)
            setOffset((prev) => (reset ? limit : prev + limit))
        } catch (e: any) {
            if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return
            const msg = e?.response?.data?.message || 'Failed to load brew history'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // initial load with cancel support to avoid duplicate work in StrictMode
        const controller = new AbortController()
        load(true, controller.signal)
        return () => controller.abort()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coffeeId])

    if (loading && items.length === 0) {
        return (
            <Box data-testid="brewlog-list" sx={{ mt: 2 }}>
                <CircularProgress size={24} aria-label="Loading" />
            </Box>
        )
    }

    if (error) {
        return (
            <Box data-testid="brewlog-list" sx={{ mt: 2 }}>
                <Alert severity="error" data-testid="error-state" action={<Button onClick={() => load(true)}>Retry</Button>}>
                    {error}
                </Alert>
            </Box>
        )
    }

    if (items.length === 0) {
        return (
            <Box data-testid="brewlog-list" sx={{ mt: 2 }}>
                <Alert severity="info" data-testid="empty-state" action={<Button component={RouterLink} to={`/brew-logs/new?coffeeId=${coffeeId}`}>Log New Brew</Button>}>
                    No brew logs yet for this coffee.
                </Alert>
            </Box>
        )
    }

    const formatDateTime = (iso: string) => {
        try {
            const d = new Date(iso)
            const date = d.toLocaleDateString()
            const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            return `${date}, ${time}`
        } catch {
            return iso
        }
    }

    const params = (cw?: number, ww?: number, rating?: number) => {
        const parts: string[] = []
        if (typeof cw === 'number' && typeof ww === 'number' && cw > 0 && ww > 0) {
            const ratio = (ww / cw)
            parts.push(`${cw}g → ${ww}g (1:${ratio.toFixed(1)})`)
        }
        if (typeof rating === 'number') {
            parts.push(`★${rating}`)
        }
        return parts.join(' • ')
    }

    const summarize = (notes?: string) => {
        if (!notes) return ''
        const firstLine = notes.split('\n')[0]
        return firstLine.length > 120 ? firstLine.slice(0, 117) + '...' : firstLine
    }

    return (
        <Stack spacing={2} data-testid="brewlog-list" sx={{ mt: 2 }}>
            <List>
                {items.map((it) => (
                    <ListItemButton
                        key={it.id}
                        data-testid="brewlog-item"
                        onClick={() => navigate(`/brew-logs/${it.id}`)}
                    >
                        <ListItemText
                            primary={`${formatDateTime(it.createdAt)} - ${it.brewMethod}`}
                            secondary={[params(it.coffeeWeight, it.waterWeight, it.rating), summarize(it.tastingNotes)].filter(Boolean).join(' • ')}
                        />
                    </ListItemButton>
                ))}
            </List>
            {hasMore && (
                <Button variant="outlined" onClick={() => load(false)} disabled={loading}>
                    {loading ? 'Loading…' : 'Load more'}
                </Button>
            )}
        </Stack>
    )
}

const CoffeeDetailPage: React.FC = () => {
    const { id } = useParams()
    const coffeeIdNum = useMemo(() => Number(id || '0'), [id])
    const coffeeRes = useCachedGet<{ coffee: any } | null>({
        url: coffeeIdNum > 0 ? `/api/v1/coffees/${coffeeIdNum}` : null,
        ttlMs: 60000,
        deps: [coffeeIdNum],
    })
    const coffee = coffeeRes.data?.coffee ?? null
    const loading = coffeeRes.loading
    const error = coffeeRes.error ? (coffeeRes.error?.response?.data?.message || 'Failed to load coffee') : null
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Coffee Detail
            </Typography>
            <Paper sx={{ p: 4, mb: 2 }}>
                {loading && (
                    <Box sx={{ mb: 2 }}>
                        <CircularProgress size={20} />
                    </Box>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}
                {coffee && (
                    <Stack spacing={1} sx={{ mb: 2 }}>
                        <Typography variant="h6">{coffee.name}</Typography>
                        {coffee.roaster && <Typography variant="body2">Roaster: {coffee.roaster}</Typography>}
                        {coffee.origin && <Typography variant="body2">Origin: {coffee.origin}</Typography>}
                        {coffee.description && <Typography variant="body2">{coffee.description}</Typography>}
                    </Stack>
                )}
                {coffeeIdNum > 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to={`/brew-logs/new?coffeeId=${coffeeIdNum}`}
                        data-testid="log-new-brew"
                    >
                        Log New Brew
                    </Button>
                )}
            </Paper>
            {coffeeIdNum > 0 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Brew History
                    </Typography>
                    <BrewLogList coffeeId={coffeeIdNum} />
                </Paper>
            )}
        </Box>
    )
}

export default CoffeeDetailPage
