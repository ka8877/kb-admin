// 공통코드 관리 그리드 컬럼 정의
import { GridColDef } from '@mui/x-data-grid';
import { IconButton, Stack } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { CodeGroupDisplay, CodeItemDisplay } from '../types';

/**
 * 코드그룹 (대분류) 컬럼
 */
export const codeGroupColumns: GridColDef<CodeGroupDisplay>[] = [
  {
    field: 'no',
    headerName: 'No',
    width: 60,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'group_code',
    headerName: '그룹코드',
    width: 180,
  },
  {
    field: 'group_name',
    headerName: '그룹명',
    flex: 1,
  },
  {
    field: 'is_active',
    headerName: '사용여부',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (params.value === 0 ? '미사용' : '사용'),
  },
];

/**
 * 코드아이템 (소분류) 컬럼
 */
export const codeItemColumns: GridColDef<CodeItemDisplay>[] = [
  {
    field: 'sort_order',
    headerName: '정렬순서',
    width: 100,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'code',
    headerName: '코드',
    width: 150,
  },
  {
    field: 'code_name',
    headerName: '코드명',
    flex: 1,
  },
  {
    field: 'is_active',
    headerName: '사용여부',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (params.value === 0 ? '미사용' : '사용'),
  },
];

// 레거시 컬럼 (하위 호환성)
export const majorColumns = codeGroupColumns;
export const minorColumns = codeItemColumns;
