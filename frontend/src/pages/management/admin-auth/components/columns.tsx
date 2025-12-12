// frontend/src/pages/management/admin-auth/components/columns.tsx
import { GridColDef } from '@mui/x-data-grid';

export const listColumns: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 80 },
  { field: 'user_name', headerName: '사용자명', width: 150 },
  { field: 'position', headerName: '직책', width: 120 },
  { field: 'team_1st', headerName: '1차팀', width: 150 },
  { field: 'team_2nd', headerName: '2차팀', width: 150 },
  { field: 'use_permission', headerName: '이용권한', width: 150 },
  { field: 'status', headerName: '활성여부', width: 100 },
];
