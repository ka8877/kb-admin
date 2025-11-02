import type React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Stack, Typography, Card, CardContent, Divider } from '@mui/material';
import { helloApi } from '../../api';
import PageHeader from '../../components/common/PageHeader';
import InlineSpinner from '../../components/common/spinner/InlineSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const DashboardPage: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['hello'],
    queryFn: helloApi.getHello,
  });

  return (
    <Stack spacing={3}>
      <PageHeader title="대시보드" />

      <Card>
        <CardContent>
          <Typography variant="h6">React Query example</Typography>
          <Divider sx={{ my: 2 }} />
          {isLoading ? (
            <InlineSpinner />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : (
            <Typography>API says: {data?.message}</Typography>
          )}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default DashboardPage;
