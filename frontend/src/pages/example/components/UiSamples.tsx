import type React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
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
} from '@mui/material';

export type UiSamplesProps = {
  onExportCsv: () => void;
  canExport: boolean;
  onRefresh: () => void;
  refreshing: boolean;
};

const UiSamples: React.FC<UiSamplesProps> = ({ onExportCsv, canExport, onRefresh, refreshing }) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6">토스트/컨펌/CSV/새로고침 테스트</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => setOpenConfirm(true)}>
              컨펌창 테스트
            </Button>
            <Button variant="contained" onClick={() => toast.success('토스트가 표시되었습니다.')}>
              토스트 테스트
            </Button>
            <Button variant="outlined" onClick={onExportCsv} disabled={!canExport}>
              CSV 내보내기
            </Button>
            <Button variant="text" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? '갱신 중...' : '데이터 새로고침'}
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
    </>
  );
};

export default UiSamples;
