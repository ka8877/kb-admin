// frontend/src/pages/management/common-code/components/columns.tsx
import { GridColDef } from '@mui/x-data-grid';
import type { RowItem } from '../types';

export const CODE_TYPE_LABELS: Record<string, string> = {
  SERVICE_NAME: '서비스명',
  QUESTION_CATEGORY: '질문 카테고리',
  AGE_GROUP: '연령대',
};

export const listColumns: GridColDef<RowItem>[] = [
  {
    field: 'no',
    headerName: 'No',
    width: 80,
    sortable: true,
  },
  {
    field: 'code_type',
    headerName: '코드 타입',
    width: 150,
    sortable: true,
    renderCell: (params) => CODE_TYPE_LABELS[params.value] || params.value,
  },
  {
    field: 'category_nm',
    headerName: '카테고리명',
    flex: 1,
    minWidth: 150,
    sortable: true,
  },
  {
    field: 'service_cd',
    headerName: '코드',
    width: 200,
    sortable: true,
  },
  {
    field: 'status_code',
    headerName: '활성여부',
    width: 120,
    sortable: true,
    renderCell: (params) => (params.value === 'Y' ? '활성' : '비활성'),
  },
];
