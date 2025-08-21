import React, { useState } from 'react'
import { Box, Typography, TextField, Button, Paper, Stack, Snackbar, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const MAX_NAME = 255
const MAX_ORIGIN = 100
const MAX_ROASTER = 255

const CoffeeNewPage: React.FC = () => {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [origin, setOrigin] = useState('')
    const [roaster, setRoaster] = useState('')
    const [description, setDescription] = useState('')
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({ open: false, message: '', severity: 'success' })

    const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null
        setPhotoFile(f)
        if (f) {
            const url = URL.createObjectURL(f)
            setPhotoPreview(url)
        } else {
            setPhotoPreview(null)
        }
    }

    const validate = (): string | null => {
        if (!name.trim()) return 'Name is required'
        if (name.length > MAX_NAME) return `Name must be <= ${MAX_NAME} characters`
        if (origin.length > MAX_ORIGIN) return `Origin must be <= ${MAX_ORIGIN} characters`
        if (roaster.length > MAX_ROASTER) return `Roaster must be <= ${MAX_ROASTER} characters`
        return null
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const err = validate()
        if (err) {
            setToast({ open: true, message: err, severity: 'error' })
            return
        }
        setSubmitting(true)
        try {
            const payload: Record<string, any> = {
                name: name.trim(),
            }
            if (origin.trim()) payload.origin = origin.trim()
            if (roaster.trim()) payload.roaster = roaster.trim()
            if (description.trim()) payload.description = description.trim()
            // MVP: client-only preview; do not upload file yet
            // Optionally include a placeholder photoPath, but omit by default

            await api.post('/api/v1/users/me/coffees', payload)
            setToast({ open: true, message: 'Coffee added to your collection', severity: 'success' })
            // Redirect to coffees list after a short delay
            setTimeout(() => navigate('/coffees'), 500)
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to add coffee'
            setToast({ open: true, message: msg, severity: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Add New Coffee
            </Typography>
            <Paper sx={{ p: 3 }}>
                <Box component="form" onSubmit={onSubmit} noValidate>
                    <Stack spacing={2}>
                        <TextField
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            inputProps={{ 'data-testid': 'coffee-name', maxLength: MAX_NAME }}
                            fullWidth
                        />
                        <TextField
                            label="Roaster"
                            value={roaster}
                            onChange={(e) => setRoaster(e.target.value)}
                            inputProps={{ 'data-testid': 'coffee-roaster', maxLength: MAX_ROASTER }}
                            fullWidth
                        />
                        <TextField
                            label="Origin"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            inputProps={{ 'data-testid': 'coffee-origin', maxLength: MAX_ORIGIN }}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            inputProps={{ 'data-testid': 'coffee-description' }}
                            fullWidth
                            multiline
                            minRows={3}
                        />
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button variant="outlined" component="label">
                                Upload Photo
                                <input data-testid="coffee-photo" hidden accept="image/*" type="file" onChange={onPhotoChange} />
                            </Button>
                            {photoFile && <Typography variant="body2">{photoFile.name}</Typography>}
                            {photoPreview && <img src={photoPreview} alt="Preview" style={{ maxHeight: 80, borderRadius: 4 }} />}
                        </Stack>
                        <Button data-testid="submit-new-coffee" type="submit" variant="contained" disabled={submitting}>
                            {submitting ? 'Adding…' : 'Add Coffee'}
                        </Button>
                    </Stack>
                </Box>
            </Paper>
            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
                <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default CoffeeNewPage

