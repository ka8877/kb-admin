import type { GridColDef } from '@mui/x-data-grid';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
import {
  QST_ID,
  SERVICE_NM,
  DISPLAY_CTNT,
  PROMPT_CTNT,
  QST_CTGR,
  QST_STYLE,
  PARENT_ID,
  PARENT_NM,
  AGE_GRP,
  SHOW_U17,
  IMP_START_DATE,
  IMP_END_DATE,
  UPDATED_AT,
  CREATED_AT,
  STATUS,
} from '@/pages/data-reg/recommended-questions/data';

export const recommendedQuestionColumns: GridColDef<RecommendedQuestionItem>[] = [
  { field: 'no', headerName: 'no', width: 80 },
  { field: QST_ID, headerName: '질문 아이디', width: 120 },
  { field: SERVICE_NM, headerName: '서비스명', flex: 1, minWidth: 100 },
  { field: DISPLAY_CTNT, headerName: '질문', flex: 2, minWidth: 250 },
  { field: PROMPT_CTNT, headerName: 'AI input 쿼리', flex: 2, minWidth: 140 },
  { field: QST_CTGR, headerName: '질문 카테고리', flex: 1, minWidth: 180 },
  { field: QST_STYLE, headerName: '질문 태그', flex: 1, minWidth: 160 },
  { field: PARENT_ID, headerName: '부모 아이디', width: 140 },
  { field: PARENT_NM, headerName: '부모 아이디명', flex: 1, minWidth: 160 },
  { field: AGE_GRP, headerName: '연령대', width: 100 },
  { field: SHOW_U17, headerName: '17세 미만 노출 여부', width: 150 },
  { field: IMP_START_DATE, headerName: '노출 시작일시', width: 180 },
  { field: IMP_END_DATE, headerName: '노출 종료일시', width: 180 },
  { field: UPDATED_AT, headerName: '마지막 수정일시', width: 180 },
  { field: CREATED_AT, headerName: '반영일시', width: 180 },
  { field: STATUS, headerName: '반영 상태', width: 140 },
];
