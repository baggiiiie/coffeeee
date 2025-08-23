import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, LinearProgress, FormControl, RadioGroup, FormControlLabel, Radio, Alert, Typography } from '@mui/material'
import { useAI } from '../utils/useAI'

type Answer = { id: string; value: string }
type Option = { label: string; value: string }
type Question = { questionId: string; text: string; options: Option[]; hint?: string }

interface Props {
    open: boolean
    brewMethod: string
    onClose: () => void
    onComplete: (notes: string) => void
}

const AITastingAssistant: React.FC<Props> = ({ open, brewMethod, onClose, onComplete }) => {
    const { getNextQuestion, loading } = useAI()
    const [questions, setQuestions] = useState<Question[]>([])
    const [answers, setAnswers] = useState<Answer[]>([])
    const [current, setCurrent] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [selected, setSelected] = useState<string>('')

    const context = useMemo(() => ({ brewMethod: brewMethod || undefined }), [brewMethod])
    const initialized = useRef(false)

    const currentQuestion = questions[current]

    const loadNext = useCallback(async (tries: number = 1) => {
        setError(null)
        try {
            const q = await getNextQuestion(answers, context, tries)
            setQuestions((prev) => (current < prev.length - 1 ? prev : [...prev, q]))
        } catch (e: any) {
            setError(e?.message || 'Failed to load next question')
        }
    }, [answers, context, current, getNextQuestion])

    useEffect(() => {
        if (open && !initialized.current) {
            initialized.current = true
            // initial question
            ;(async () => {
                await loadNext(1)
            })()
        }
    }, [open, loadNext])

    // keep selected synced with current answer when navigating
    useEffect(() => {
        const ans = answers[current]
        setSelected(ans ? ans.value : '')
    }, [current, answers])

    const onBack = () => {
        if (current > 0) setCurrent((c) => c - 1)
    }

    const onNext = async () => {
        if (!currentQuestion || !selected) return
        const existing = answers[current]
        const nextAnswers = [...answers]
        nextAnswers[current] = { id: currentQuestion.questionId, value: selected }
        setAnswers(nextAnswers)
        // advance
        setCurrent((c) => c + 1)
        // if we don't yet have a next question, fetch it
        if (current >= questions.length - 1) {
            await loadNext()
        }
    }

    const onFinish = () => {
        // Include the current selection in answers if not yet saved
        const finalAnswers = [...answers]
        if (currentQuestion && selected) {
            finalAnswers[current] = { id: currentQuestion.questionId, value: selected }
        }
        // Compose notes from selected option labels mapped by answers
        const parts: string[] = finalAnswers
            .map((a, idx) => {
                const q = questions[idx]
                const opt = q?.options.find((o) => o.value === a.value)
                return opt?.label
            })
            .filter(Boolean) as string[]
        const notes = parts.join(', ')
        onComplete(notes)
    }

    const onRetry = async () => {
        // On retry, allow one internal retry with backoff
        await loadNext(2)
    }

    const onReset = () => {
        setQuestions([])
        setAnswers([])
        setCurrent(0)
        setSelected('')
        setError(null)
        initialized.current = false
        // Trigger re-init on next open-cycle if still open
        if (open) {
            initialized.current = true
            ;(async () => {
                await loadNext()
            })()
        }
    }

    const canBack = current > 0
    const canNext = !!currentQuestion && !!selected
    const canFinish = answers.length > 0 || (!!currentQuestion && !!selected)

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="ai-guide-title" fullWidth maxWidth="sm" data-testid="ai-guide" role="dialog">
            <DialogTitle id="ai-guide-title">AI Tasting Guide</DialogTitle>
            <DialogContent>
                {loading && <LinearProgress />}
                {error && (
                    <Stack spacing={1} sx={{ my: 1 }}>
                        <Alert severity="error">{error}</Alert>
                        <Button variant="outlined" onClick={onRetry} data-testid="ai-retry">Retry</Button>
                    </Stack>
                )}
                {!error && currentQuestion && (
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Step {current + 1}
                        </Typography>
                        <Typography variant="h6" data-testid="ai-question">{currentQuestion.text}</Typography>
                        {currentQuestion.hint && (
                            <Typography variant="body2" color="text.secondary">{currentQuestion.hint}</Typography>
                        )}
                        <FormControl>
                            <RadioGroup
                                aria-label="tasting options"
                                name="tasting-options"
                                value={selected}
                                onChange={(e) => setSelected(e.target.value)}
                            >
                                {currentQuestion.options.map((o) => (
                                    <FormControlLabel
                                        key={o.value}
                                        value={o.value}
                                        control={<Radio inputProps={{ 'data-testid': 'ai-option' }} />}
                                        label={o.label}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button color="inherit" onClick={onReset} data-testid="ai-reset">Reset</Button>
                <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                    <Button onClick={onClose} data-testid="ai-cancel">Cancel</Button>
                    <Button onClick={onBack} disabled={!canBack} data-testid="ai-back">Back</Button>
                    <Button onClick={onNext} disabled={!canNext} variant="contained" data-testid="ai-next">Next</Button>
                    <Button onClick={onFinish} disabled={!canFinish} variant="contained" color="success" data-testid="ai-finish">Finish</Button>
                </Stack>
            </DialogActions>
        </Dialog>
    )
}

export default AITastingAssistant
