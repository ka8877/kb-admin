import type React from 'react'
import { Alert, AlertTitle } from '@mui/material'

export type ErrorMessageProps = {
  title?: string
  error: unknown
}

const getMessage = (error: unknown): string => {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title = 'Error', error }) => {
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {getMessage(error)}
    </Alert>
  )
}

export default ErrorMessage
