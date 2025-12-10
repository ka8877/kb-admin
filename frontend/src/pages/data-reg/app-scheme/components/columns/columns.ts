import type { GridColDef } from '@mui/x-data-grid';
import type { AppSchemeItem } from '@/pages/data-reg/app-scheme/types';

export const appSchemeColumns: GridColDef<AppSchemeItem>[] = [
  { field: 'no', headerName: 'No', width: 70 },
  { field: 'appSchemeId', headerName: '아이디', width: 80 },
  { field: 'productMenuName', headerName: 'AI 검색 노출 버튼명', width: 180 },
  { field: 'description', headerName: '앱스킴 설명', flex: 1, minWidth: 200 },
  { field: 'appSchemeLink', headerName: '앱스킴 주소', flex: 1, minWidth: 250 },
  { field: 'oneLink', headerName: '원링크 주소', flex: 1, minWidth: 250 },
  { field: 'goodsNameList', headerName: '연관 상품/서비스 리스트', width: 200 },
  { field: 'parentId', headerName: 'MID', width: 110 },
  { field: 'parentTitle', headerName: 'MID 상품/서비스명', width: 160 },
  { field: 'startDate', headerName: '노출 시작일시', width: 170 },
  { field: 'endDate', headerName: '노출 종료일시', width: 170 },
  { field: 'updatedAt', headerName: '마지막 수정일시', width: 170 },
  { field: 'createdAt', headerName: '반영일시', width: 170 },
  { field: 'status', headerName: '데이터 등록 반영 상태', width: 180 },
];
