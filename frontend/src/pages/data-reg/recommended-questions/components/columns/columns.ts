import type { GridColDef } from '@mui/x-data-grid';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';

export const recommendedQuestionColumns: GridColDef<RecommendedQuestionItem>[] = [
  { field: 'no', headerName: 'No', width: 80 },
  { field: 'qstId', headerName: '질문아이디', width: 120 },
  { field: 'serviceNm', headerName: '서비스명', flex: 1, minWidth: 100 },
  { field: 'displayCtnt', headerName: '질문내용', flex: 2, minWidth: 250 },
  { field: 'promptCtnt', headerName: 'AI input 쿼리', flex: 2, minWidth: 140 },
  { field: 'qstCtgr', headerName: '질문카테고리', flex: 1, minWidth: 180 },
  { field: 'qstStyle', headerName: '질문태그', flex: 1, minWidth: 160 },
  { field: 'parentId', headerName: '부모아이디', width: 140 },
  { field: 'parentNm', headerName: '부모아이디명', flex: 1, minWidth: 160 },
  { field: 'ageGrp', headerName: '연령대', width: 100 },
  { field: 'showU17', headerName: '17세미만노출여부', width: 150 },
  { field: 'impStartDate', headerName: '노출시작일시', width: 180 },
  { field: 'impEndDate', headerName: '노출종료일시', width: 180 },
  { field: 'updatedAt', headerName: '마지막수정일시', width: 180 },
  { field: 'createdAt', headerName: '반영일시', width: 180 },
  { field: 'status', headerName: '데이터등록반영상태', width: 140 },
];
