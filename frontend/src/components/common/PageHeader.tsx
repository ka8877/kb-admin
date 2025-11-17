import type React from 'react';
import { Stack, Typography, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Page-level header (페이지 제목/섹션 헤더)
// - 앱 전역 헤더(AppHeader) 아래, 컨텐츠 영역 내부에서 페이지의 제목과 서브타이틀, 우측 액션을 표시합니다.
// - 리스트/상세/대시보드 등 각 페이지 최상단의 설명/액션 바 역할입니다.

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  right?: React.ReactNode;
};

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, right }) => {
  const navigate = useNavigate();

  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separator=">">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            if (isLast || !item.path) {
              return (
                <Typography key={index} color="text.primary" fontSize="14px">
                  {item.label}
                </Typography>
              );
            }

            return (
              <Link
                key={index}
                component="button"
                onClick={() => item.path && navigate(item.path)}
                underline="hover"
                color="text.secondary"
                fontSize="14px"
                sx={{ cursor: 'pointer' }}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack>
          <Typography variant="h4" fontWeight={700} sx={{ fontSize: '1.875rem' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        {right}
      </Stack>
    </Stack>
  );
};

export default PageHeader;
