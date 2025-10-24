import type React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Divider, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import type { CreateExampleInput } from '../../../types/example'
import { exampleApi } from '../../../api'

export type CreateFormProps = {
  onCreated?: () => void
}

const defaultValues: CreateExampleInput = {
  name: '',
  email: '',
  status: 'ACTIVE',
}

const CreateForm: React.FC<CreateFormProps> = ({ onCreated }) => {
  const { control, handleSubmit, reset, formState } = useForm<CreateExampleInput>({
    defaultValues,
    mode: 'onChange',
  })

  const { mutateAsync: createAsync, isPending, error: createError } = useMutation({
    mutationFn: exampleApi.create,
    onSuccess: () => {
      reset(defaultValues)
      onCreated?.()
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    await createAsync(values)
  })

  return (
    <>
      <Typography variant="h6">생성 폼</Typography>
      <Divider sx={{ my: 2 }} />
      <form onSubmit={onSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Controller
              name="name"
              control={control}
              rules={{ required: '이름을 입력하세요', minLength: { value: 2, message: '최소 2자 이상' } }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="이름"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: '이메일을 입력하세요',
                pattern: { value: /[^@\s]+@[^@\s]+\.[^@\s]+/, message: '이메일 형식이 아닙니다' },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="이메일"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="상태" select fullWidth size="small">
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" disabled={!formState.isValid || isPending}>
                {isPending ? '생성 중...' : '생성'}
              </Button>
              <Button type="button" variant="outlined" onClick={() => reset(defaultValues)} disabled={isPending}>
                초기화
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
      {Boolean(createError) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          생성 중 오류가 발생했습니다
        </Alert>
      )}
    </>
  )
}

export default CreateForm
