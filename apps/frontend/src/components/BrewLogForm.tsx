import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Typography, Paper, TextField, Button, Stack, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { useCachedGet } from '../hooks/useCachedGet'
import AITastingAssistant from './AITastingAssistant'
import AIBrewRecommendationDialog from './AIBrewRecommendationDialog'
import { Alert as MuiAlert } from '@mui/material'

type BrewLogFormProps = {
    mode: 'create' | 'edit' | 'view'
    brewLogId?: number
    initialData?: any
    onSave?: () => void
    onCancel?: () => void
    title?: string
}

type BrewLog = {
    id: number
    userId: number
    coffeeId: number
    brewMethod: string
    coffeeWeight?: number
    waterWeight?: number
    grindSize?: string
    waterTemperature?: number
    brewTime?: number
    tastingNotes?: string
    rating?: number
    createdAt: string
}

const BrewLogForm: React.FC<BrewLogFormProps> = ({
    mode,
    brewLogId,
    initialData: _initialData,
    onSave,
    onCancel,
    title
}) => {
    const navigate = useNavigate()
    const location = useLocation() as any
    const [params] = useSearchParams()
    const coffeeId = useMemo(() => Number(params.get('coffeeId') || '0'), [params])
    const [selectedCoffeeId, setSelectedCoffeeId] = useState<number>(coffeeId)
    const [brewMethod, setBrewMethod] = useState('')
    const [coffeeWeight, setCoffeeWeight] = useState<string>('')
    const [waterWeight, setWaterWeight] = useState<string>('')
    const [grindSize, setGrindSize] = useState('')
    const [waterTemp, setWaterTemp] = useState<string>('')
    const [brewMin, setBrewMin] = useState<string>('')
    const [brewSec, setBrewSec] = useState<string>('')
    const [tastingNotes, setTastingNotes] = useState('')
    const [rating, setRating] = useState<string>('')
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })
    const [aiOpen, setAiOpen] = useState(false)
    const [recoOpen, setRecoOpen] = useState(false)
    const [showRecoCTA, setShowRecoCTA] = useState(false)
    const [prefillNote, setPrefillNote] = useState<string | null>(null)
    const [error, setError] = useState<{ status: number; message: string } | null>(null)
    const headingRef = useRef<HTMLHeadingElement>(null)

    // Local edit toggle when starting in "view" mode
    const [isEditing, setIsEditing] = useState(false)
    const effectiveMode: 'create' | 'edit' | 'view' = mode === 'view' ? (isEditing ? 'edit' : 'view') : mode

    // For edit/view modes, fetch existing brew log data
    const brewRes = useCachedGet<BrewLog>({
        url: effectiveMode !== 'create' && brewLogId ? `/api/v1/brewlogs/${brewLogId}` : null,
        ttlMs: 10000,
        deps: [brewLogId, effectiveMode],
    })

    // Use cached fetches to reduce boilerplate and duplicate calls
    const coffeesRes = useCachedGet<{ coffees: Array<{ id: number; name: string }> }>({
        url: mode === 'create' && !selectedCoffeeId ? '/api/v1/coffees' : null,
        ttlMs: 60000,
        deps: [selectedCoffeeId, mode],
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

    const initialBrewParams = location?.state?.initialBrewParams as any | undefined
    const fromGuideTitle = location?.state?.fromGuideTitle as string | undefined

    // Populate state from loaded brew when not creating (shared for view/edit)
    const loadedFromIdRef = useRef<number | null>(null)
    useEffect(() => {
        if (effectiveMode !== 'create' && brewRes.data && brewLogId) {
            if (loadedFromIdRef.current === brewLogId) return
            const data = brewRes.data
            setSelectedCoffeeId(data.coffeeId)
            setBrewMethod(data.brewMethod || '')
            setCoffeeWeight(data.coffeeWeight != null ? String(data.coffeeWeight) : '')
            setWaterWeight(data.waterWeight != null ? String(data.waterWeight) : '')
            setGrindSize(data.grindSize || '')
            setWaterTemp(data.waterTemperature != null ? String(data.waterTemperature) : '')
            if (data.brewTime != null) {
                const total = Number(data.brewTime) || 0
                const m = Math.floor(total / 60)
                const s = total % 60
                setBrewMin(String(m))
                setBrewSec(String(s))
            }
            setTastingNotes(data.tastingNotes || '')
            setRating(data.rating != null ? String(data.rating) : '')
            loadedFromIdRef.current = brewLogId
        }
    }, [effectiveMode, brewRes.data, brewLogId])

    // When viewing, ensure coffee name lookup gets the correct coffeeId
    useEffect(() => {
        if (effectiveMode === 'view' && brewRes.data) {
            setSelectedCoffeeId(brewRes.data.coffeeId)
        }
    }, [effectiveMode, brewRes.data])

    // Handle create mode initial data
    useEffect(() => {
        if (mode === 'create' && initialBrewParams) {
            if (initialBrewParams.brewMethod) setBrewMethod(initialBrewParams.brewMethod)
            if (initialBrewParams.coffeeWeight != null) setCoffeeWeight(String(initialBrewParams.coffeeWeight))
            if (initialBrewParams.waterWeight != null) setWaterWeight(String(initialBrewParams.waterWeight))
            if (initialBrewParams.grindSize) setGrindSize(String(initialBrewParams.grindSize))
            if (initialBrewParams.waterTemperature != null) setWaterTemp(String(initialBrewParams.waterTemperature))
            if (initialBrewParams.brewTime != null) {
                const total = Number(initialBrewParams.brewTime) || 0
                const m = Math.floor(total / 60)
                const s = total % 60
                setBrewMin(String(m))
                setBrewSec(String(s))
            }
            if (initialBrewParams.tastingNotes) setTastingNotes(initialBrewParams.tastingNotes)
            if (initialBrewParams.rating != null) setRating(String(initialBrewParams.rating))

            // Set prefill note if we have fromGuideTitle or initialBrewParams
            if (fromGuideTitle) {
                setPrefillNote(`Prefilled from ${fromGuideTitle}`)
            } else if (initialBrewParams) {
                setPrefillNote('Prefilled from previous brew')
            }

            setTimeout(() => headingRef.current?.focus(), 0)
        }
    }, [mode, initialBrewParams, fromGuideTitle])

    // Handle errors
    useEffect(() => {
        if (brewRes.error) {
            const status = brewRes.error?.response?.status || 0
            const message = brewRes.error?.response?.data?.message || 'Failed to load brew log'
            setError({ status, message })
        } else {
            setError(null)
        }
    }, [brewRes.error])

    const ratio = useMemo(() => {
        const cw = parseFloat(coffeeWeight)
        const ww = parseFloat(waterWeight)
        if (!isFinite(cw) || !isFinite(ww) || cw <= 0 || ww <= 0) return ''
        return (ww / cw).toFixed(1)
    }, [coffeeWeight, waterWeight])

    const totalBrewSeconds = useMemo(() => {
        if (brewMin === '' && brewSec === '') return null
        const m = brewMin === '' ? 0 : parseInt(brewMin, 10)
        const s = brewSec === '' ? 0 : parseInt(brewSec, 10)
        if (isNaN(m) || isNaN(s)) return null
        return m * 60 + s
    }, [brewMin, brewSec])

    const boundsValid = () => {
        const cw = coffeeWeight === '' ? null : parseInt(coffeeWeight, 10)
        if (cw !== null && (isNaN(cw) || cw < 0 || cw > 200)) return false
        const ww = waterWeight === '' ? null : parseInt(waterWeight, 10)
        if (ww !== null && (isNaN(ww) || ww < 0 || ww > 3000)) return false
        const wt = waterTemp === '' ? null : parseInt(waterTemp, 10)
        if (wt !== null && (isNaN(wt) || wt < 0 || wt > 100)) return false
        if (brewSec !== '' && (isNaN(parseInt(brewSec, 10)) || parseInt(brewSec, 10) < 0 || parseInt(brewSec, 10) > 59)) return false
        if (brewMin !== '' && (isNaN(parseInt(brewMin, 10)) || parseInt(brewMin, 10) < 0 || parseInt(brewMin, 10) > 60)) return false
        const bt = totalBrewSeconds
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
            const payload: any = {
                brewMethod: brewMethod.trim()
            }
            if (coffeeWeight.trim() !== '') payload.coffeeWeight = parseInt(coffeeWeight, 10)
            if (waterWeight.trim() !== '') payload.waterWeight = parseInt(waterWeight, 10)
            if (grindSize.trim() !== '') payload.grindSize = grindSize.trim()
            if (waterTemp.trim() !== '') payload.waterTemperature = parseInt(waterTemp, 10)
            if (totalBrewSeconds !== null) payload.brewTime = totalBrewSeconds
            if (tastingNotes.trim() !== '') payload.tastingNotes = tastingNotes.trim()
            if (rating.trim() !== '') payload.rating = parseInt(rating, 10)

            if (effectiveMode === 'create') {
                payload.coffeeId = selectedCoffeeId
                const res = await api.post('/api/v1/brewlogs', payload)
                const newId = res?.data?.id
                if (newId) {
                    navigate(`/brew-logs/${newId}`)
                    return
                }
                // Fallback: show success if id missing, but stay
                setToast({ open: true, message: 'Brew log saved', severity: 'success' })
                setShowRecoCTA(true)
            } else {
                await api.put(`/api/v1/brewlogs/${brewLogId}`, payload)
                setToast({ open: true, message: 'Brew log updated', severity: 'success' })
                // If started from view, refresh data but stay in edit mode
                if (mode === 'view') {
                    await brewRes.refetch({ bypassCache: true })
                    // Return to view mode after successful save
                    setIsEditing(false)
                }
                if (onSave) onSave()
            }
        } catch (err: any) {
            const status = err?.response?.status
            let msg = err?.response?.data?.message || 'Failed to save brew log'
            if (status === 403) {
                msg = effectiveMode === 'create' ? 'You can only log brews for your own coffees.' : 'You can only update your own brew logs.'
            }
            setToast({ open: true, message: msg, severity: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancel = () => {
        if (mode === 'view' && isEditing) {
            // Go back to view-only when cancelling inline edit
            setIsEditing(false)
            return
        }
        if (onCancel) {
            onCancel()
        } else {
            navigate(-1)
        }
    }

    if ((effectiveMode === 'edit' || effectiveMode === 'view') && brewRes.loading) {
        return (
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {title || (effectiveMode === 'edit' ? 'Edit Brew Log' : 'Brew Log Detail')}
                </Typography>
                <Paper sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Typography>Loading...</Typography>
                    </Stack>
                </Paper>
            </Box>
        )
    }

    if ((effectiveMode === 'edit' || effectiveMode === 'view') && error) {
        const testId = error.status === 401 ? 'error-401' : error.status === 403 ? 'error-403' : error.status === 404 ? 'error-404' : 'error-generic'
        return (
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {title || (effectiveMode === 'edit' ? 'Edit Brew Log' : 'Brew Log Detail')}
                </Typography>
                <Paper sx={{ p: 3 }}>
                    <Alert severity="error" data-testid={testId}>{error.message}</Alert>
                </Paper>
            </Box>
        )
    }

    const readonly = effectiveMode === 'view'
    const formatDate = (iso: string) => { try { return new Date(iso).toLocaleString() } catch { return iso } }

    return (
        <>
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom tabIndex={-1} ref={headingRef}>
                    {title || (effectiveMode === 'create' ? 'Log New Brew' : (readonly ? 'Brew Log Detail' : 'Edit Brew Log'))}
                </Typography>
                <Paper sx={{ p: 3 }}>
                    {effectiveMode === 'create' && showRecoCTA && (
                        <MuiAlert severity="info" sx={{ mb: 2 }} data-testid="next-reco-cta"
                            action={<Button variant="outlined" size="small" onClick={() => setRecoOpen(true)}>Get a recommendation for next time</Button>}>
                            Brew saved. Want guidance for your next brew?
                            <Button size="small" onClick={() => setShowRecoCTA(false)} sx={{ ml: 1 }}>Dismiss</Button>
                        </MuiAlert>
                    )}
                    {effectiveMode === 'create' && prefillNote && (
                        <MuiAlert severity="info" sx={{ mb: 2 }} data-testid="prefill-note"
                            action={<Button variant="outlined" size="small" onClick={() => {
                                if (initialBrewParams) {
                                    setBrewMethod(initialBrewParams.brewMethod || '')
                                    setCoffeeWeight(initialBrewParams.coffeeWeight != null ? String(initialBrewParams.coffeeWeight) : '')
                                    setWaterWeight(initialBrewParams.waterWeight != null ? String(initialBrewParams.waterWeight) : '')
                                    setGrindSize(initialBrewParams.grindSize || '')
                                    setWaterTemp(initialBrewParams.waterTemperature != null ? String(initialBrewParams.waterTemperature) : '')
                                    const total = initialBrewParams.brewTime != null ? Number(initialBrewParams.brewTime) : null
                                    if (total !== null && !isNaN(total)) {
                                        const m = Math.floor(total / 60)
                                        const s = total % 60
                                        setBrewMin(String(m))
                                        setBrewSec(String(s))
                                    } else {
                                        setBrewMin('')
                                        setBrewSec('')
                                    }
                                }
                            }}>Reset to defaults</Button>}>
                            {prefillNote}
                        </MuiAlert>
                    )}
                    <Box component="form" onSubmit={onSubmit} noValidate>
                        <Stack spacing={2}>
                            {readonly && brewRes.data && (
                                <Typography variant="subtitle1">Created: {formatDate(brewRes.data.createdAt)}</Typography>
                            )}
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
                                disabled={readonly}
                                required
                                inputProps={{ 'data-testid': 'brew-method' }}
                                fullWidth
                            />
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    label="Coffee (g)"
                                    value={coffeeWeight}
                                    onChange={(e) => setCoffeeWeight(e.target.value.replace(/\D+/g, ''))}
                                    disabled={readonly}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'data-testid': 'coffee-weight' }}
                                    fullWidth
                                />
                                <TextField
                                    label="Water (g)"
                                    value={waterWeight}
                                    onChange={(e) => setWaterWeight(e.target.value.replace(/\D+/g, ''))}
                                    disabled={readonly}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'data-testid': 'water-weight' }}
                                    fullWidth
                                />
                                <TextField label="Ratio" value={ratio} disabled fullWidth />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    label="Grind Size (Clicks)"
                                    value={grindSize}
                                    onChange={(e) => setGrindSize(e.target.value.replace(/\D+/g, ''))}
                                    disabled={readonly}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'data-testid': 'grind-size' }}
                                    fullWidth
                                />
                                <TextField
                                    label="Water Temp (°C)"
                                    value={waterTemp}
                                    onChange={(e) => setWaterTemp(e.target.value.replace(/\D+/g, ''))}
                                    disabled={readonly}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'data-testid': 'water-temp' }}
                                    fullWidth
                                />
                                <Stack direction={{ xs: 'row' }} spacing={2} sx={{ width: '100%' }}>
                                    <TextField
                                        label="Brew Time (min)"
                                        value={brewMin}
                                        onChange={(e) => setBrewMin(e.target.value.replace(/\D+/g, ''))}
                                        disabled={readonly}
                                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'data-testid': 'brew-minutes' }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Brew Time (sec)"
                                        value={brewSec}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D+/g, '')
                                            const n = v === '' ? '' : String(Math.min(59, parseInt(v, 10)))
                                            setBrewSec(n)
                                        }}
                                        disabled={readonly}
                                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'data-testid': 'brew-seconds' }}
                                        fullWidth
                                    />
                                </Stack>
                            </Stack>
                            <TextField
                                label="Tasting Notes"
                                value={tastingNotes}
                                onChange={(e) => setTastingNotes(e.target.value)}
                                disabled={readonly}
                                inputProps={{ 'data-testid': 'tasting-notes' }}
                                fullWidth
                                multiline
                                minRows={3}
                            />
                            {effectiveMode !== 'view' && (
                                <Stack direction="row" spacing={2}>
                                    <Button variant="outlined" onClick={() => setAiOpen(true)} data-testid="open-ai-guide">AI Tasting Guide</Button>
                                </Stack>
                            )}
                            <TextField
                                label="Rating (1–5)"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                disabled={readonly}
                                inputProps={{ inputMode: 'numeric', 'data-testid': 'rating' }}
                                fullWidth
                            />
                            {effectiveMode !== 'view' && (
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={!canSubmit || submitting}
                                        data-testid={effectiveMode === 'create' ? 'submit-brewlog' : 'save-edit'}
                                    >
                                        {submitting ? 'Saving…' : (effectiveMode === 'create' ? 'Save Brew Log' : 'Save')}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handleCancel}
                                        data-testid={effectiveMode === 'create' ? 'cancel-brewlog' : 'cancel-edit'}
                                    >
                                        Cancel
                                    </Button>
                                </Stack>
                            )}
                        </Stack>
                    </Box>
                    {readonly && (
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button type="button" variant="contained" onClick={() => setIsEditing(true)} data-testid="edit-button">Update</Button>
                            <Button type="button" variant="outlined" onClick={() => setRecoOpen(true)} data-testid="ai-recommendation">AI Recommendation</Button>
                            {brewRes.data && (
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => {
                                        const data = brewRes.data!
                                        const initial = {
                                            brewMethod: data.brewMethod,
                                            coffeeWeight: data.coffeeWeight,
                                            waterWeight: data.waterWeight,
                                            grindSize: data.grindSize,
                                            waterTemperature: data.waterTemperature,
                                            brewTime: data.brewTime,
                                            tastingNotes: data.tastingNotes,
                                            rating: data.rating,
                                        }
                                        navigate(`/brew-logs/new?coffeeId=${data.coffeeId}`, { state: { initialBrewParams: initial } })
                                    }}
                                    data-testid="create-from-this"
                                >
                                    New Brew From This
                                </Button>
                            )}
                        </Stack>
                    )}
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
                    coffeeId: selectedCoffeeId,
                    brewMethod: brewMethod || undefined,
                    coffeeWeight: coffeeWeight ? parseInt(coffeeWeight, 10) : undefined,
                    waterWeight: waterWeight ? parseInt(waterWeight, 10) : undefined,
                    grindSize: grindSize || undefined,
                    waterTemperature: waterTemp ? parseInt(waterTemp, 10) : undefined,
                    brewTime: totalBrewSeconds ?? undefined,
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
