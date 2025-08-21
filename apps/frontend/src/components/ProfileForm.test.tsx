import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ProfileForm from './ProfileForm'

describe('ProfileForm', () => {
  it('disables submit until form is dirty and valid', () => {
    const onSubmit = vi.fn()
    render(
      <ProfileForm
        initialValues={{ username: 'alice', email: 'alice@example.com' }}
        onSubmit={onSubmit}
      />
    )

    const submit = screen.getByTestId('submit-button') as HTMLButtonElement
    expect(submit.disabled).toBe(true)

    // Make invalid change
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'invalid' } })
    expect(screen.getByText('Email format is invalid')).toBeInTheDocument()
    expect(submit.disabled).toBe(true)

    // Fix email and ensure submit is enabled
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'alice2@example.com' } })
    expect(submit.disabled).toBe(false)
  })

  it('calls onSubmit with only changed fields', () => {
    const onSubmit = vi.fn()
    render(
      <ProfileForm
        initialValues={{ username: 'alice', email: 'alice@example.com' }}
        onSubmit={onSubmit}
      />
    )
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'alice_new' } })
    fireEvent.click(screen.getByTestId('submit-button'))
    expect(onSubmit).toHaveBeenCalledWith({ username: 'alice_new' })
  })
})

