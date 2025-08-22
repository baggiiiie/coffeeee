import React, { useMemo, useState } from 'react'
// @ts-ignore: MenuItem will be used in future iterations
import { Box, Typography, Paper, TextField, Button, Stack, Snackbar, Alert, MenuItem } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'

const BrewLogForm: React.FC = () => {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const coffeeId = useMemo(() => Number(params.get('coffeeId') || '0'), [params])
    const [brewMethod, setBrewMethod] = useState('')
    const [coffeeWeight, setCoffeeWeight] = useState<string>('')
    const [waterWeight, setWaterWeight] = useState<string>('')
    const [grindSize, setGrindSize] = useState('')
    const [waterTemp, setWaterTemp] = useState<string>('')
    const [brewTime, setBrewTime] = useState<string>('')
    const [tastingNotes, setTastingNotes] = useState('')
    const [rating, setRating] = useState<string>('')
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({ open: false, message: '', severity: 'success' })

    const ratio = useMemo(() => {
        const cw = parseFloat(coffeeWeight)
        const ww = parseFloat(waterWeight)
        if (!isFinite(cw) || !isFinite(ww) || cw <= 0 || ww <= 0) return ''
        return (ww / cw).toFixed(1)
    }, [coffeeWeight, waterWeight])

    const boundsValid = () => {
        const cw = coffeeWeight === '' ? null : parseFloat(coffeeWeight)
        if (cw !== null && (isNaN(cw) || cw < 0 || cw > 200)) return false
        const ww = waterWeight === '' ? null : parseFloat(waterWeight)
        if (ww !== null && (isNaN(ww) || ww < 0 || ww > 3000)) return false
        const wt = waterTemp === '' ? null : parseFloat(waterTemp)
        if (wt !== null && (isNaN(wt) || wt < 0 || wt > 100)) return false
        const bt = brewTime === '' ? null : parseInt(brewTime, 10)
        if (bt !== null && (isNaN(bt) || bt < 0 || bt > 3600)) return false
        const r = rating === '' ? null : parseInt(rating, 10)
        if (r !== null && (isNaN(r) || r < 1 || r > 5)) return false
        return true
    }

    const canSubmit = coffeeId > 0 && brewMethod.trim() !== '' && boundsValid()

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit) return
        setSubmitting(true)
        try {
            const payload: any = { coffeeId, brewMethod: brewMethod.trim() }
            if (coffeeWeight.trim() !== '') payload.coffeeWeight = parseFloat(coffeeWeight)
            if (waterWeight.trim() !== '') payload.waterWeight = parseFloat(waterWeight)
            if (grindSize.trim() !== '') payload.grindSize = grindSize.trim()
            if (waterTemp.trim() !== '') payload.waterTemperature = parseFloat(waterTemp)
            if (brewTime.trim() !== '') payload.brewTime = parseInt(brewTime, 10)
            if (tastingNotes.trim() !== '') payload.tastingNotes = tastingNotes.trim()
            if (rating.trim() !== '') payload.rating = parseInt(rating, 10)
            await api.post('/api/v1/brewlogs', payload)
            setToast({ open: true, message: 'Brew log saved', severity: 'success' })
            setTimeout(() => navigate(`/coffees/${coffeeId}`), 400)
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to save brew log'
            setToast({ open: true, message: msg, severity: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Log New Brew
            </Typography>
            <Paper sx={{ p: 3 }}>
                <Box component="form" onSubmit={onSubmit} noValidate>
                    <Stack spacing={2}>
                        <TextField label="Coffee ID" value={coffeeId} disabled fullWidth data-testid="coffee-id" />
                        <TextField
                            label="Brew Method"
                            value={brewMethod}
                            onChange={(e) => setBrewMethod(e.target.value)}
                            required
                            inputProps={{ 'data-testid': 'brew-method' }}
                            fullWidth
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField label="Coffee (g)" value={coffeeWeight} onChange={(e) => setCoffeeWeight(e.target.value)} inputProps={{ inputMode: 'decimal', 'data-testid': 'coffee-weight' }} fullWidth />
                            <TextField label="Water (g)" value={waterWeight} onChange={(e) => setWaterWeight(e.target.value)} inputProps={{ inputMode: 'decimal', 'data-testid': 'water-weight' }} fullWidth />
                            <TextField label="Ratio" value={ratio} disabled fullWidth />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField label="Grind Size" value={grindSize} onChange={(e) => setGrindSize(e.target.value)} inputProps={{ 'data-testid': 'grind-size' }} fullWidth />
                            <TextField label="Water Temp (°C)" value={waterTemp} onChange={(e) => setWaterTemp(e.target.value)} inputProps={{ inputMode: 'decimal', 'data-testid': 'water-temp' }} fullWidth />
                            <TextField label="Brew Time (s)" value={brewTime} onChange={(e) => setBrewTime(e.target.value)} inputProps={{ inputMode: 'numeric', 'data-testid': 'brew-time' }} fullWidth />
                        </Stack>
                        <TextField label="Tasting Notes" value={tastingNotes} onChange={(e) => setTastingNotes(e.target.value)} inputProps={{ 'data-testid': 'tasting-notes' }} fullWidth multiline minRows={3} />
                        <TextField label="Rating (1–5)" value={rating} onChange={(e) => setRating(e.target.value)} inputProps={{ inputMode: 'numeric', 'data-testid': 'rating' }} fullWidth />
                        <Stack direction="row" spacing={2}>
                            <Button type="submit" variant="contained" disabled={!canSubmit || submitting} data-testid="submit-brewlog">{submitting ? 'Saving…' : 'Save Brew Log'}</Button>
                            <Button variant="outlined" color="secondary" onClick={() => navigate(-1)} data-testid="cancel-brewlog">Cancel</Button>
                        </Stack>
                    </Stack>
                </Box>
            </Paper>
            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
                <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>{toast.message}</Alert>
            </Snackbar>
        </Box>
    )
}

export default BrewLogForm
