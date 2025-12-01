// frontend/src/pages/management/common-code/components/columns.tsx
import { GridColDef } from '@mui/x-data-grid';
import type { RowItem } from '../types';
import type { CodeTypeOption } from '@/mocks/commonCodeDb';

export const CODE_TYPE_LABELS: Record<string, string> = {
  SERVICE_NAME: '서비스명',
  QUESTION_CATEGORY: '질문 카테고리',
  AGE_GROUP: '연령대',
};

// 기존 listColumns는 유지하되 사용하지 않을 수 있음 (참고용)
export const listColumns: GridColDef<RowItem>[] = [
  {
    field: 'display_no',
    headerName: 'No',
    width: 80,
    sortable: true,
    valueGetter: (params) => params.row.display_no || params.row.no,
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
    width: 200,
    sortable: true,
  },
  {
    field: 'service_cd',
    headerName: '코드',
    width: 250,
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

// 대분류 (코드 타입) 컬럼
export const majorColumns: GridColDef<CodeTypeOption>[] = [
  {
    field: 'value',
    headerName: '코드 타입 ID',
    width: 180,
  },
  {
    field: 'label',
    headerName: '코드 타입 명',
    flex: 1,
  },
  {
    field: 'useYn',
    headerName: '사용여부',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (params.value === 'N' ? '미사용' : '사용'),
  },
];

// 소분류 (공통 코드 아이템) 컬럼
export const minorColumns: GridColDef<RowItem>[] = [
  {
    field: 'no',
    headerName: 'No',
    width: 60,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'service_cd',
    headerName: '코드',
    width: 180,
  },
  {
    field: 'category_nm',
    headerName: '코드명',
    flex: 1,
  },
  {
    field: 'parent_service_cd',
    headerName: '상위 코드',
    width: 120,
    renderCell: (params) => params.value || '-',
  },
  {
    field: 'status_code',
    headerName: '사용여부',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (params.value === 'Y' ? '사용' : '미사용'),
  },
];
