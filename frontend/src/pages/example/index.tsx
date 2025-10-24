import type React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';
import {
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { exampleApi } from '../../api';
import type { ExampleItem } from '../../types/example';
import CreateForm from './form/CreateForm';
import { exampleColumns } from './columns';
import { toast } from 'react-toastify';

const ExamplePage: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [openConfirm, setOpenConfirm] = useState(false);

  // Fetch all items once; client-side pagination handled by DataGrid
  const { data, isLoading, error, isFetching, refetch } = useQuery<ExampleItem[]>({
    queryKey: ['examples'],
    queryFn: exampleApi.list,
  });

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

      {/* 맨 위: 토스트/컨펌 테스트 */}
      <Card>
        <CardContent>
          <Typography variant="h6">샘플</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => setOpenConfirm(true)}>
              컨펌창 테스트
            </Button>
            <Button variant="contained" onClick={() => toast.success('토스트가 표시되었습니다.')}>
              토스트 테스트
            </Button>
            <Button variant="outlined" onClick={handleExportCsv} disabled={!(data && data.length)}>
              CSV 내보내기
            </Button>
            <Button variant="text" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? '갱신 중...' : '데이터 새로고침'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>확인</DialogTitle>
        <DialogContent>정말로 확인하시겠습니까?</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenConfirm(false);
              toast.info('취소했습니다.');
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenConfirm(false);
              toast.success('확인했습니다.');
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

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
