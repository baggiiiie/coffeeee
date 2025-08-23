import React, { useMemo, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Chip, LinearProgress, Alert, Typography } from '@mui/material'
import { useAI } from '../utils/useAI'

type BrewLogPartial = {
    coffeeId?: number
    brewMethod?: string
    coffeeWeight?: number
    waterWeight?: number
    grindSize?: string
    waterTemperature?: number
    brewTime?: number
    tastingNotes?: string
    rating?: number
}

interface Props {
    open: boolean
    brewLog: BrewLogPartial
    onClose: () => void
    onApply?: (change: { variable: string; delta: string }) => void
}

const presets = ['more sweetness', 'less bitterness', 'more strength']

const AIBrewRecommendationDialog: React.FC<Props> = ({ open, brewLog, onClose, onApply }) => {
    const { getBrewRecommendation, loading } = useAI()
    const [goal, setGoal] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<{ variable: string; delta: string; explanation: string } | null>(null)

    const request = useMemo(() => ({ brewLog, goal }), [brewLog, goal])

    const onSubmit = async () => {
        setError(null)
        setResult(null)
        try {
            const res = await getBrewRecommendation(request)
            setResult({ variable: res.change.variable, delta: res.change.delta, explanation: res.explanation })
        } catch (e: any) {
            setError(e?.message || 'Failed to get recommendation')
        }
    }

    const onRetry = async () => {
        await onSubmit()
    }

    const onPreset = (p: string) => {
        setGoal(p)
    }

    const onApplyClick = () => {
        if (result && onApply) onApply({ variable: result.variable, delta: result.delta })
        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="ai-reco-title" fullWidth maxWidth="sm" data-testid="reco-dialog">
            <DialogTitle id="ai-reco-title">AI Brew Recommendation</DialogTitle>
            <DialogContent>
                {loading && <LinearProgress />}
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <Typography variant="body2">What’s your goal for next brew?</Typography>
                    <Stack direction="row" spacing={1}>
                        {presets.map((p) => (
                            <Chip key={p} label={p} onClick={() => onPreset(p)} clickable />
                        ))}
                    </Stack>
                    <TextField
                        label="Goal"
                        placeholder="e.g., more sweetness, less bitterness"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        fullWidth
                        inputProps={{ 'data-testid': 'reco-goal' }}
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                    {result && (
                        <Stack spacing={1} data-testid="reco-result">
                            <Typography variant="subtitle1">Suggested change</Typography>
                            <Typography variant="body1">
                                Change <b>{result.variable}</b>: {result.delta}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {result.explanation}
                            </Typography>
                        </Stack>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button variant="outlined" onClick={onRetry} disabled={!goal} data-testid="reco-retry">Retry</Button>
                <Button variant="contained" onClick={onSubmit} disabled={!goal} data-testid="reco-submit">Get Recommendation</Button>
                <Button variant="contained" color="success" onClick={onApplyClick} disabled={!result} data-testid="reco-apply">
                    Apply to draft brew
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AIBrewRecommendationDialog

