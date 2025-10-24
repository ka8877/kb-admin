import type React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';
import { Card, CardContent, Divider, Stack, Typography, Grid } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { exampleApi } from '../../api';
import type { ExampleItem } from '../../types/example';
import CreateForm from './form/CreateForm';
import { exampleColumns } from './columns';
import UiSamples from './components/UiSamples';

const ExamplePage: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const { data, isLoading, error, isFetching, refetch } = useQuery<ExampleItem[]>({
    queryKey: ['examples'],
    queryFn: exampleApi.list,
  });

  // Todo : 공통 컴포넌트로 만들어야됨
  const handleExportCsv = () => {
    const rows = data ?? [];
    if (!rows.length) return;
    const headers = ['id', 'name', 'email', 'status', 'createdAt'];
    const escape = (v: unknown) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const csv = [
      headers.join(','),
      ...rows.map((r) => [r.id, r.name, r.email, r.status, r.createdAt].map(escape).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `examples_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="예제 (React Hook Form + React Query)"
        subtitle="MUI DataGrid 기반 생성/조회 샘플"
      />

      <UiSamples
        onExportCsv={handleExportCsv}
        canExport={Boolean(data && data.length)}
        onRefresh={() => refetch()}
        refreshing={isFetching}
      />

      {/* 생성폼 + 그리드 같은 라인 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <CreateForm onCreated={() => refetch()} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
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
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ExamplePage;
