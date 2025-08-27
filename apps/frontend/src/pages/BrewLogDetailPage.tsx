import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Paper, Stack, Button, CircularProgress, Alert, TextField } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import AIBrewRecommendationDialog from '../components/AIBrewRecommendationDialog'

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

const BrewLogDetailPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const logId = useMemo(() => Number(id || '0'), [id])
  const [data, setData] = useState<BrewLog | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ status: number; message: string } | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [recoOpen, setRecoOpen] = useState(false)

  // Edit state
  const [brewMethod, setBrewMethod] = useState('')
  const [coffeeWeight, setCoffeeWeight] = useState('')
  const [waterWeight, setWaterWeight] = useState('')
  const [grindSize, setGrindSize] = useState('')
  const [waterTemp, setWaterTemp] = useState('')
  const [brewTime, setBrewTime] = useState('')
  const [tastingNotes, setTastingNotes] = useState('')
  const [rating, setRating] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    if (!logId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/v1/brewlogs/${logId}`)
      setData(res.data as BrewLog)
    } catch (e: any) {
      const status = e?.response?.status || 0
      const message = e?.response?.data?.message || 'Failed to load brew log'
      setError({ status, message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [logId])

  const enterEditMode = () => {
    if (!data) return
    setBrewMethod(data.brewMethod || '')
    setCoffeeWeight(data.coffeeWeight != null ? String(data.coffeeWeight) : '')
    setWaterWeight(data.waterWeight != null ? String(data.waterWeight) : '')
    setGrindSize(data.grindSize || '')
    setWaterTemp(data.waterTemperature != null ? String(data.waterTemperature) : '')
    setBrewTime(data.brewTime != null ? String(data.brewTime) : '')
    setTastingNotes(data.tastingNotes || '')
    setRating(data.rating != null ? String(data.rating) : '')
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
  }

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

  const onSave = async () => {
    if (!data) return
    if (brewMethod.trim() === '' || !boundsValid()) return
    setSaving(true)
    try {
      const payload: any = { brewMethod: brewMethod.trim() }
      payload.coffeeWeight = coffeeWeight === '' ? null : parseFloat(coffeeWeight)
      payload.waterWeight = waterWeight === '' ? null : parseFloat(waterWeight)
      payload.grindSize = grindSize
      payload.waterTemperature = waterTemp === '' ? null : parseFloat(waterTemp)
      payload.brewTime = brewTime === '' ? null : parseInt(brewTime, 10)
      payload.tastingNotes = tastingNotes
      payload.rating = rating === '' ? null : parseInt(rating, 10)
      await api.put(`/api/v1/brewlogs/${data.id}`, payload)
      setEditMode(false)
      await load()
    } catch (e: any) {
      const status = e?.response?.status || 0
      const message = e?.response?.data?.message || 'Failed to save changes'
      setError({ status, message })
    } finally {
      setSaving(false)
    }
  }

  const ratio = useMemo(() => {
    const cw = coffeeWeight === '' ? NaN : parseFloat(coffeeWeight)
    const ww = waterWeight === '' ? NaN : parseFloat(waterWeight)
    if (!isFinite(cw) || !isFinite(ww) || cw <= 0 || ww <= 0) return ''
    return (ww / cw).toFixed(1)
  }, [coffeeWeight, waterWeight])

  if (loading) {
    return (
      <Box sx={{ py: 4 }} data-testid="brewlog-detail">
        <CircularProgress size={24} aria-label="Loading" />
      </Box>
    )
  }

  if (error) {
    const testId = error.status === 401 ? 'error-401' : error.status === 403 ? 'error-403' : error.status === 404 ? 'error-404' : 'error-generic'
    return (
      <Box sx={{ py: 4 }} data-testid="brewlog-detail">
        <Alert severity="error" data-testid={testId}>{error.message}</Alert>
      </Box>
    )
  }

  if (!data) return null

  const formatDate = (iso: string) => { try { return new Date(iso).toLocaleString() } catch { return iso } }

  return (
    <Box sx={{ py: 4 }} data-testid="brewlog-detail">
      <Typography variant="h4" gutterBottom>
        Brew Log Detail
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1">Created: {formatDate(data.createdAt)}</Typography>
          <TextField label="Coffee ID" value={data.coffeeId} disabled fullWidth data-testid="coffee-id" />
          <TextField
            label="Brew Method"
            value={editMode ? brewMethod : data.brewMethod}
            onChange={(e) => setBrewMethod(e.target.value)}
            required
            inputProps={{ 'data-testid': 'brew-method' }}
            fullWidth
            disabled={!editMode}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Coffee (g)" value={editMode ? coffeeWeight : (data.coffeeWeight ?? '')} onChange={(e) => setCoffeeWeight(e.target.value)} inputProps={{ inputMode: 'decimal', 'data-testid': 'coffee-weight' }} fullWidth disabled={!editMode} />
            <TextField label="Water (g)" value={editMode ? waterWeight : (data.waterWeight ?? '')} onChange={(e) => setWaterWeight(e.target.value)} inputProps={{ inputMode: 'decimal', 'data-testid': 'water-weight' }} fullWidth disabled={!editMode} />
            <TextField label="Ratio" value={editMode ? ratio : (data.coffeeWeight && data.waterWeight ? (data.waterWeight / data.coffeeWeight).toFixed(1) : '')} disabled fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Grind Size" value={editMode ? grindSize : (data.grindSize ?? '')} onChange={(e) => setGrindSize(e.target.value)} inputProps={{ 'data-testid': 'grind-size' }} fullWidth disabled={!editMode} />
            <TextField label="Water Temp (°C)" value={editMode ? waterTemp : (data.waterTemperature ?? '')} onChange={(e) => setWaterTemp(e.target.value)} inputProps={{ inputMode: 'decimal', 'data-testid': 'water-temp' }} fullWidth disabled={!editMode} />
            <TextField label="Brew Time (s)" value={editMode ? brewTime : (data.brewTime ?? '')} onChange={(e) => setBrewTime(e.target.value)} inputProps={{ inputMode: 'numeric', 'data-testid': 'brew-time' }} fullWidth disabled={!editMode} />
          </Stack>
          <TextField label="Tasting Notes" value={editMode ? tastingNotes : (data.tastingNotes ?? '')} onChange={(e) => setTastingNotes(e.target.value)} inputProps={{ 'data-testid': 'tasting-notes' }} fullWidth multiline minRows={3} disabled={!editMode} />
          <TextField label="Rating (1–5)" value={editMode ? rating : (data.rating ?? '')} onChange={(e) => setRating(e.target.value)} inputProps={{ inputMode: 'numeric', 'data-testid': 'rating' }} fullWidth disabled={!editMode} />

          <Stack direction="row" spacing={2}>
            {!editMode ? (
              <Button variant="contained" onClick={enterEditMode} data-testid="edit-button">Update</Button>
            ) : (
              <>
                <Button variant="contained" disabled={saving || brewMethod.trim() === '' || !boundsValid()} onClick={onSave} data-testid="save-edit">{saving ? 'Saving…' : 'Save'}</Button>
                <Button variant="outlined" color="secondary" onClick={cancelEdit}>Cancel</Button>
              </>
            )}
            <Button variant="outlined" onClick={() => setRecoOpen(true)} data-testid="ai-recommendation">AI Recommendation</Button>
            <Button
              variant="outlined"
              onClick={() => {
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
              Create New From This
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <AIBrewRecommendationDialog
        open={recoOpen}
        brewLog={{
          coffeeId: data.coffeeId,
          brewMethod: data.brewMethod || undefined,
          coffeeWeight: data.coffeeWeight,
          waterWeight: data.waterWeight,
          grindSize: data.grindSize || undefined,
          waterTemperature: data.waterTemperature,
          brewTime: data.brewTime,
          tastingNotes: data.tastingNotes || undefined,
          rating: data.rating,
        }}
        onClose={() => setRecoOpen(false)}
        onApply={() => setRecoOpen(false)}
      />
    </Box>
  )
}

export default BrewLogDetailPage

