import type React from 'react'
import { Stack, Typography } from '@mui/material'

// Page-level header (페이지 제목/섹션 헤더)
// - 앱 전역 헤더(AppHeader) 아래, 컨텐츠 영역 내부에서 페이지의 제목과 서브타이틀, 우측 액션을 표시합니다.
// - 리스트/상세/대시보드 등 각 페이지 최상단의 설명/액션 바 역할입니다.

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
