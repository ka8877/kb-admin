import type { GridColDef } from '@mui/x-data-grid';
import type { AppSchemeItem } from '@/pages/data-reg/app-scheme/types';
import {
  NO,
  APP_SCHEME_ID,
  PRODUCT_MENU_NAME,
  DESCRIPTION,
  APP_SCHEME_LINK,
  ONE_LINK,
  GOODS_NAME_LIST,
  PARENT_ID,
  PARENT_TITLE,
  START_DATE,
  END_DATE,
  UPDATED_AT,
  CREATED_AT,
  STATUS,
} from '../../data';

export const appSchemeColumns: GridColDef<AppSchemeItem>[] = [
  { field: NO, headerName: 'No', width: 70 },
  { field: APP_SCHEME_ID, headerName: '아이디', width: 80 },
  { field: PRODUCT_MENU_NAME, headerName: 'AI 검색 노출 버튼명', width: 180 },
  { field: DESCRIPTION, headerName: '앱스킴 설명', flex: 1, minWidth: 200 },
  { field: APP_SCHEME_LINK, headerName: '앱스킴 주소', flex: 1, minWidth: 250 },
  { field: ONE_LINK, headerName: '원링크 주소', flex: 1, minWidth: 250 },
  { field: GOODS_NAME_LIST, headerName: '연관 상품/서비스 리스트', width: 200 },
  { field: PARENT_ID, headerName: 'MID', width: 110 },
  { field: PARENT_TITLE, headerName: 'MID 상품/서비스명', width: 160 },
  { field: START_DATE, headerName: '노출 시작일시', width: 170 },
  { field: END_DATE, headerName: '노출 종료일시', width: 170 },
  { field: UPDATED_AT, headerName: '마지막 수정일시', width: 170 },
  { field: CREATED_AT, headerName: '반영일시', width: 170 },
  { field: STATUS, headerName: '데이터 등록 반영 상태', width: 180 },
];
