import type React from 'react';
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import PageHeader from '../components/common/PageHeader';

const HomePage: React.FC = () => {
  return (
    <Stack spacing={3}>
      <PageHeader title="홈" />

      <Card>
        <CardContent>
          <Typography variant="h6">환영합니다</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography>Admin 초기화면 구축</Typography>
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary">
        UI: MUI v5 • State: Zustand • Data: React Query • Build: Vite • Router: react-router-dom +
        파일 기반
      </Typography>
    </Stack>
  );
};

export default HomePage;
