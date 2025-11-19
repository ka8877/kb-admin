import type { GridColDef } from '@mui/x-data-grid';
import { AppSchemeItem } from '../../types';

export const appSchemeColumns: GridColDef<AppSchemeItem>[] = [
  { field: 'no', headerName: 'No', width: 70 },
  { field: 'id', headerName: '아이디', width: 80 },
  { field: 'product_menu_name', headerName: 'AI검색 노출버튼명', width: 180 },
  { field: 'description', headerName: '앱스킴 설명', flex: 1, minWidth: 200 },
  { field: 'app_scheme_link', headerName: '앱스킴 주소', flex: 1, minWidth: 250 },
  { field: 'one_link', headerName: '원링크 주소', flex: 1, minWidth: 250 },
  { field: 'goods_name_list', headerName: '연관 상품/서비스 리스트', width: 200 },
  { field: 'parent_id', headerName: 'MID', width: 110 },
  { field: 'parent_title', headerName: 'MID 상품/서비스명', width: 160 },
  { field: 'start_date', headerName: '노출시작일시', width: 170 },
  { field: 'end_date', headerName: '노출종료일시', width: 170 },
  { field: 'updatedAt', headerName: '마지막수정일시', width: 170 },
  { field: 'registeredAt', headerName: '반영일시', width: 170 },
  { field: 'status', headerName: '데이터등록반영상태', width: 180 },
];
