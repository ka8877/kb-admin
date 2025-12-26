// 공통코드 관리 그리드 컬럼 정의
import { GridColDef } from '@mui/x-data-grid';
import type { CodeGroupDisplay, CodeItemDisplay } from '../types';
import { NO, GROUP_CODE, GROUP_NAME, CODE, CODE_NAME, SORT_ORDER, IS_ACTIVE } from '../data';

/**
 * 코드그룹 (대분류) 컬럼
 */
export const codeGroupColumns: GridColDef<CodeGroupDisplay>[] = [
  {
    field: NO,
    headerName: 'No',
    width: 60,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: GROUP_CODE,
    headerName: '그룹코드',
    width: 180,
  },
  {
    field: GROUP_NAME,
    headerName: '그룹명',
    flex: 1,
  },
  {
    field: IS_ACTIVE,
    headerName: '사용여부',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (params.value ? '사용' : '미사용'),
  },
];

/**
 * 코드아이템 (소분류) 컬럼
 */
export const codeItemColumns: GridColDef<CodeItemDisplay>[] = [
  {
    field: SORT_ORDER,
    headerName: '정렬순서',
    width: 100,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: CODE,
    headerName: '코드',
    width: 150,
  },
  {
    field: CODE_NAME,
    headerName: '코드명',
    flex: 1,
  },
  {
    field: IS_ACTIVE,
    headerName: '사용여부',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (params.value ? '사용' : '미사용'),
  },
];

// 레거시 컬럼 (하위 호환성)
export const majorColumns = codeGroupColumns;
export const minorColumns = codeItemColumns;
