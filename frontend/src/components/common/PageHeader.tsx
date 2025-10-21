import { Stack, Typography } from '@mui/material'

export type PageHeaderProps = {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, right }) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
      <Stack>
        <Typography variant="h4" fontWeight={700}>{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        )}
      </Stack>
      {right}
    </Stack>
  )
}

export default PageHeader
