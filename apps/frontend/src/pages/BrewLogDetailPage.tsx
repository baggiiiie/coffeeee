import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Paper, Stack, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { useParams } from 'react-router-dom'
import api from '../utils/api'

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
  const logId = useMemo(() => Number(id || '0'), [id])
  const [data, setData] = useState<BrewLog | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ status: number; message: string } | null>(null)
  const [editOpen, setEditOpen] = useState(false)

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

  const openEdit = () => {
    if (!data) return
    setBrewMethod(data.brewMethod || '')
    setCoffeeWeight(data.coffeeWeight != null ? String(data.coffeeWeight) : '')
    setWaterWeight(data.waterWeight != null ? String(data.waterWeight) : '')
    setGrindSize(data.grindSize || '')
    setWaterTemp(data.waterTemperature != null ? String(data.waterTemperature) : '')
    setBrewTime(data.brewTime != null ? String(data.brewTime) : '')
    setTastingNotes(data.tastingNotes || '')
    setRating(data.rating != null ? String(data.rating) : '')
    setEditOpen(true)
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
      setEditOpen(false)
      await load()
    } catch (e: any) {
      const status = e?.response?.status || 0
      const message = e?.response?.data?.message || 'Failed to save changes'
      setError({ status, message })
    } finally {
      setSaving(false)
    }
  }

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
      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1">Method: {data.brewMethod}</Typography>
          <Typography variant="body2">Created: {formatDate(data.createdAt)}</Typography>
          <Typography variant="body2">Coffee ID: {data.coffeeId}</Typography>
          {data.coffeeWeight != null && <Typography variant="body2">Coffee: {data.coffeeWeight} g</Typography>}
          {data.waterWeight != null && <Typography variant="body2">Water: {data.waterWeight} g</Typography>}
          {data.grindSize && <Typography variant="body2">Grind: {data.grindSize}</Typography>}
          {data.waterTemperature != null && <Typography variant="body2">Water Temp: {data.waterTemperature} °C</Typography>}
          {data.brewTime != null && <Typography variant="body2">Brew Time: {data.brewTime} s</Typography>}
          {data.rating != null && <Typography variant="body2">Rating: {data.rating}</Typography>}
          {data.tastingNotes && <Typography variant="body2">Notes: {data.tastingNotes}</Typography>}
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={openEdit} data-testid="edit-button">Edit</Button>
        </Stack>
      </Paper>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} data-testid="edit-dialog">
        <DialogTitle>Edit Brew Log</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1, minWidth: 360 }}>
            <TextField label="Brew Method" value={brewMethod} onChange={(e) => setBrewMethod(e.target.value)} required inputProps={{ 'data-testid': 'brew-method' }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Coffee (g)" value={coffeeWeight} onChange={(e) => setCoffeeWeight(e.target.value)} inputProps={{ inputMode: 'decimal', 'data-testid': 'coffee-weight' }} fullWidth />
              <TextField label="Water (g)" value={waterWeight} onChange={(e) => setWaterWeight(e.target.value)} inputProps={{ inputMode: 'decimal', 'data-testid': 'water-weight' }} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Grind Size" value={grindSize} onChange={(e) => setGrindSize(e.target.value)} fullWidth inputProps={{ 'data-testid': 'grind-size' }} />
              <TextField label="Water Temp (°C)" value={waterTemp} onChange={(e) => setWaterTemp(e.target.value)} inputProps={{ inputMode: 'decimal', 'data-testid': 'water-temp' }} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Brew Time (s)" value={brewTime} onChange={(e) => setBrewTime(e.target.value)} inputProps={{ inputMode: 'numeric', 'data-testid': 'brew-time' }} fullWidth />
              <TextField label="Rating (1-5)" value={rating} onChange={(e) => setRating(e.target.value)} inputProps={{ inputMode: 'numeric', 'data-testid': 'rating' }} fullWidth />
            </Stack>
            <TextField label="Tasting Notes" value={tastingNotes} onChange={(e) => setTastingNotes(e.target.value)} multiline minRows={3} inputProps={{ 'data-testid': 'tasting-notes' }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saving || brewMethod.trim() === '' || !boundsValid()} onClick={onSave} data-testid="save-edit">{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BrewLogDetailPage

