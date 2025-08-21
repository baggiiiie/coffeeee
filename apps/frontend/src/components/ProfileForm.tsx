import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Paper, Stack, TextField } from '@mui/material'

export interface ProfileFormValues {
  username: string
  email: string
}

interface ProfileFormProps {
  initialValues: ProfileFormValues
  submitting?: boolean
  onSubmit: (values: Partial<ProfileFormValues>) => Promise<void> | void
  onCancel?: () => void
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/

const ProfileForm: React.FC<ProfileFormProps> = ({ initialValues, submitting, onSubmit, onCancel }) => {
  const [username, setUsername] = useState(initialValues.username)
  const [email, setEmail] = useState(initialValues.email)
  const [errors, setErrors] = useState<{ username?: string; email?: string; form?: string }>({})

  const isDirty = useMemo(() => {
    return username !== initialValues.username || email !== initialValues.email
  }, [username, email, initialValues.username, initialValues.email])

  const validate = () => {
    const next: { username?: string; email?: string; form?: string } = {}
    if (username && !usernameRegex.test(username)) {
      next.username = 'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens'
    }
    if (email && !emailRegex.test(email)) {
      next.email = 'Email format is invalid'
    }
    if (!username && !email) {
      next.form = 'At least one field must be provided'
    }
    setErrors(next)
    return next
  }

  useEffect(() => {
    validate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, email])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v.username || v.email || v.form) return
    const payload: Partial<ProfileFormValues> = {}
    if (username !== initialValues.username) payload.username = username
    if (email !== initialValues.email) payload.email = email
    await onSubmit(payload)
  }

  const handleCancel = () => {
    setUsername(initialValues.username)
    setEmail(initialValues.email)
    setErrors({})
    onCancel?.()
  }

  const isValid = !errors.username && !errors.email && !errors.form

  return (
    <Paper sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            error={Boolean(errors.username)}
            helperText={errors.username || ' '}
            inputProps={{ 'data-testid': 'username-input' }}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email || ' '}
            inputProps={{ 'data-testid': 'email-input' }}
          />
          {errors.form && (
            <div role="alert" data-testid="form-error" style={{ color: '#d32f2f' }}>{errors.form}</div>
          )}
          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              data-testid="submit-button"
              disabled={!isDirty || !isValid || Boolean(submitting)}
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  )
}

export default ProfileForm

