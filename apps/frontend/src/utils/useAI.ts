import { useCallback, useState } from 'react'
import api from './api'

export type AIAnswer = { id: string; value: string }
export type AIContext = { brewMethod?: string }
export type AIQuestion = { questionId: string; text: string; options: Array<{ label: string; value: string }>; hint?: string }

export function useAI() {
    const [loading, setLoading] = useState(false)

    const postWithRetry = useCallback(async (url: string, body: any, tries = 2): Promise<any> => {
        let lastErr: any
        for (let attempt = 1; attempt <= tries; attempt++) {
            try {
                const res = await api.post(url, body, { timeout: 10_000 })
                return res.data
            } catch (err: any) {
                lastErr = err
                if (attempt < tries) {
                    // simple exponential backoff: 500ms, 1000ms
                    const delay = 500 * Math.pow(2, attempt - 1)
                    await new Promise((r) => setTimeout(r, delay))
                    continue
                }
            }
        }
        throw mapError(lastErr)
    }, [])

    const getNextQuestion = useCallback(async (answers: AIAnswer[], context?: AIContext, tries: number = 1): Promise<AIQuestion> => {
        setLoading(true)
        try {
            const data = await postWithRetry('/api/v1/ai/recommendation', { answers, context }, tries)
            return data as AIQuestion
        } finally {
            setLoading(false)
        }
    }, [postWithRetry])

    return { getNextQuestion, loading }
}

function mapError(err: any): Error {
    const status = err?.response?.status
    const msg = err?.response?.data?.message || err?.message || 'AI request failed'
    if (status === 408) return new Error('Request timed out. Please try again.')
    if (status === 502) return new Error('AI provider error. Please retry shortly.')
    return new Error(msg)
}
