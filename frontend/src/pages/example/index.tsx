import type React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { exampleApi } from '../../api';
import type { ExampleItem } from '../../types/example';
import CreateForm from './form/CreateForm';
import { exampleColumns } from './columns';

const ExamplePage: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Fetch all items once; client-side pagination handled by DataGrid
  const { data, isLoading, error, isFetching, refetch } = useQuery<ExampleItem[]>({
    queryKey: ['examples'],
    queryFn: exampleApi.list,
  });

  return (
    <Stack spacing={3}>
      <PageHeader title="예제 (React Hook Form + React Query)" subtitle="MUI DataGrid 기반 생성/조회 샘플" />

      <Card>
        <CardContent>
          <CreateForm onCreated={() => refetch()} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">목록</Typography>
          <Divider sx={{ my: 2 }} />
          {isLoading ? (
            <Loading />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : (
            <div style={{ height: 420, width: '100%' }}>
              <DataGrid
                rows={data ?? []}
                columns={exampleColumns}
                getRowId={(row) => row.id}
                pagination
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 20, 50]}
                disableRowSelectionOnClick
                density="standard"
                loading={isLoading}
                autoHeight={false}
              />
            </div>
          )}
          {isFetching && (
            <Typography variant="caption" color="text.secondary">
              갱신 중...
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ExamplePage;
