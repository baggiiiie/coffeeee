import React, { useEffect, useMemo, useRef, useState } from 'react'
// @ts-expect-error: MenuItem will be used in future iterations
import { Box, Typography, Paper, TextField, Button, Stack, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { getWithCache } from '../utils/fetchCache'
import { useCachedGet } from '../hooks/useCachedGet'
import AITastingAssistant from '../components/AITastingAssistant'
import AIBrewRecommendationDialog from '../components/AIBrewRecommendationDialog'
import { Alert as MuiAlert } from '@mui/material'

const BrewLogForm: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation() as any
    const [params] = useSearchParams()
    const coffeeId = useMemo(() => Number(params.get('coffeeId') || '0'), [params])
    const [selectedCoffeeId, setSelectedCoffeeId] = useState<number>(coffeeId)
    // selectedCoffeeName becomes derived from fetch hook
    const [brewMethod, setBrewMethod] = useState('')
    const [coffeeWeight, setCoffeeWeight] = useState<string>('')
    const [waterWeight, setWaterWeight] = useState<string>('')
    const [grindSize, setGrindSize] = useState('')
    const [waterTemp, setWaterTemp] = useState<string>('')
    const [brewTime, setBrewTime] = useState<string>('')
    const [tastingNotes, setTastingNotes] = useState('')
    const [rating, setRating] = useState<string>('')
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })
    const [aiOpen, setAiOpen] = useState(false)
    const [recoOpen, setRecoOpen] = useState(false)
    const [showRecoCTA, setShowRecoCTA] = useState(false)
    const [prefillNote, setPrefillNote] = useState<string | null>(null)
    // Use cached fetches to reduce boilerplate and duplicate calls
    const coffeesRes = useCachedGet<{ coffees: Array<{ id: number; name: string }> }>({
        url: !selectedCoffeeId ? '/api/v1/coffees' : null,
        ttlMs: 60000,
        deps: [selectedCoffeeId],
        initial: { coffees: [] },
    })
    const coffees = useMemo(() => coffeesRes.data?.coffees ?? [], [coffeesRes.data])
    const selectedCoffeeRes = useCachedGet<{ coffee?: { name?: string } }>({
        url: selectedCoffeeId > 0 ? `/api/v1/coffees/${selectedCoffeeId}` : null,
        ttlMs: 60000,
        deps: [selectedCoffeeId],
    })
    const selectedCoffeeName = useMemo(() => {
        const name = selectedCoffeeRes.data?.coffee?.name
        return name && String(name).trim() ? String(name) : (selectedCoffeeId > 0 ? 'unknown coffee' : '')
    }, [selectedCoffeeId, selectedCoffeeRes.data])
    const headingRef = useRef<HTMLHeadingElement>(null)

    const initialBrewParams = location?.state?.initialBrewParams as any | undefined

    useEffect(() => {
        // Apply prefill once on mount
        if (initialBrewParams) {
            if (initialBrewParams.brewMethod) setBrewMethod(initialBrewParams.brewMethod)
            if (initialBrewParams.coffeeWeight != null) setCoffeeWeight(String(initialBrewParams.coffeeWeight))
            if (initialBrewParams.waterWeight != null) setWaterWeight(String(initialBrewParams.waterWeight))
            if (initialBrewParams.grindSize) setGrindSize(String(initialBrewParams.grindSize))
            if (initialBrewParams.waterTemperature != null) setWaterTemp(String(initialBrewParams.waterTemperature))
            if (initialBrewParams.brewTime != null) setBrewTime(String(initialBrewParams.brewTime))
            setTimeout(() => headingRef.current?.focus(), 0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Removed manual effects; data now comes from useCachedGet hooks

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

    const canSubmit = selectedCoffeeId > 0 && brewMethod.trim() !== '' && boundsValid()

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit) return
        setSubmitting(true)
        try {
            const payload: any = { coffeeId: selectedCoffeeId, brewMethod: brewMethod.trim() }
            if (coffeeWeight.trim() !== '') payload.coffeeWeight = parseFloat(coffeeWeight)
            if (waterWeight.trim() !== '') payload.waterWeight = parseFloat(waterWeight)
            if (grindSize.trim() !== '') payload.grindSize = grindSize.trim()
            if (waterTemp.trim() !== '') payload.waterTemperature = parseFloat(waterTemp)
            if (brewTime.trim() !== '') payload.brewTime = parseInt(brewTime, 10)
            if (tastingNotes.trim() !== '') payload.tastingNotes = tastingNotes.trim()
            if (rating.trim() !== '') payload.rating = parseInt(rating, 10)
            await api.post('/api/v1/brewlogs', payload)
            setToast({ open: true, message: 'Brew log saved', severity: 'success' })
            setShowRecoCTA(true)
        } catch (err: any) {
            const status = err?.response?.status
            const msg = status === 403 ? 'You can only log brews for your own coffees.' : (err?.response?.data?.message || 'Failed to save brew log')
            setToast({ open: true, message: msg, severity: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom tabIndex={-1} ref={headingRef}>
                    Log New Brew
                </Typography>
                <Paper sx={{ p: 3 }}>
                    {showRecoCTA && (
                        <MuiAlert severity="info" sx={{ mb: 2 }} data-testid="next-reco-cta"
                            action={<Button variant="outlined" size="small" onClick={() => setRecoOpen(true)}>Get a recommendation for next time</Button>}>
                            Brew saved. Want guidance for your next brew?
                            <Button size="small" onClick={() => setShowRecoCTA(false)} sx={{ ml: 1 }}>Dismiss</Button>
                        </MuiAlert>
                    )}
                    {prefillNote && (
                        <MuiAlert severity="info" sx={{ mb: 2 }} data-testid="prefill-note"
                            action={<Button variant="outlined" size="small" onClick={() => {
                                if (initialBrewParams) {
                                    setBrewMethod(initialBrewParams.brewMethod || '')
                                    setCoffeeWeight(initialBrewParams.coffeeWeight != null ? String(initialBrewParams.coffeeWeight) : '')
                                    setWaterWeight(initialBrewParams.waterWeight != null ? String(initialBrewParams.waterWeight) : '')
                                    setGrindSize(initialBrewParams.grindSize || '')
                                    setWaterTemp(initialBrewParams.waterTemperature != null ? String(initialBrewParams.waterTemperature) : '')
                                    setBrewTime(initialBrewParams.brewTime != null ? String(initialBrewParams.brewTime) : '')
                                }
                            }}>Reset to defaults</Button>}>
                            {prefillNote}
                        </MuiAlert>
                    )}
                    <Box component="form" onSubmit={onSubmit} noValidate>
                        <Stack spacing={2}>
                            {selectedCoffeeId > 0 ? (
                                <TextField label="Coffee" value={selectedCoffeeName || 'unknown coffee'} disabled fullWidth data-testid="coffee-id" />
                            ) : (
                                <FormControl fullWidth>
                                    <InputLabel id="coffee-select-label">Select Coffee</InputLabel>
                                    <Select
                                        labelId="coffee-select-label"
                                        label="Select Coffee"
                                        value={selectedCoffeeId || ''}
                                        onChange={(e) => setSelectedCoffeeId(Number(e.target.value))}
                                        displayEmpty
                                        inputProps={{ 'data-testid': 'coffee-select' }}
                                    >
                                        <MenuItem value="" disabled>
                                            <em>Select a coffee</em>
                                        </MenuItem>
                                        {coffees.map((c) => (
                                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
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
                                <TextField label="Grind Size (Clicks)" value={grindSize} onChange={(e) => setGrindSize(e.target.value)} inputProps={{ 'data-testid': 'grind-size' }} fullWidth />
                                <TextField label="Water Temp (°C)" value={waterTemp} onChange={(e) => setWaterTemp(e.target.value)} inputProps={{ inputMode: 'decimal', 'data-testid': 'water-temp' }} fullWidth />
                                <TextField label="Brew Time (s)" value={brewTime} onChange={(e) => setBrewTime(e.target.value)} inputProps={{ inputMode: 'numeric', 'data-testid': 'brew-time' }} fullWidth />
                            </Stack>
                            <TextField label="Tasting Notes" value={tastingNotes} onChange={(e) => setTastingNotes(e.target.value)} inputProps={{ 'data-testid': 'tasting-notes' }} fullWidth multiline minRows={3} />
                            <Stack direction="row" spacing={2}>
                                <Button variant="outlined" onClick={() => setAiOpen(true)} data-testid="open-ai-guide">AI Tasting Guide</Button>
                            </Stack>
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
            <AITastingAssistant
                open={aiOpen}
                brewMethod={brewMethod}
                onClose={() => setAiOpen(false)}
                onComplete={(notes) => {
                    setTastingNotes(notes)
                    setAiOpen(false)
                }}
            />
            <AIBrewRecommendationDialog
                open={recoOpen}
                brewLog={{
                    coffeeId,
                    brewMethod: brewMethod || undefined,
                    coffeeWeight: coffeeWeight ? parseFloat(coffeeWeight) : undefined,
                    waterWeight: waterWeight ? parseFloat(waterWeight) : undefined,
                    grindSize: grindSize || undefined,
                    waterTemperature: waterTemp ? parseFloat(waterTemp) : undefined,
                    brewTime: brewTime ? parseInt(brewTime, 10) : undefined,
                    tastingNotes: tastingNotes || undefined,
                    rating: rating ? parseInt(rating, 10) : undefined,
                }}
                onClose={() => setRecoOpen(false)}
                onApply={() => {
                    setToast({ open: true, message: 'Recommendation applied to draft brew', severity: 'success' })
                    setRecoOpen(false)
                }}
            />
        </>
    )
}

export default BrewLogForm
