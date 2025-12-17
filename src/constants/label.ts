import { RECOMMENDED_QUESTION } from './queryKey';

/**
 * 라벨 상수 정의
 */
export const LABELS = {
  MANUAL_INPUT: '직접 입력하기',
  EXCEL_UPLOAD: '엑셀 파일로 일괄 등록',
  DOWNLOAD_ALL_XLSX: '전체목록 XLSX 다운로드',
} as const;

export const TABLE_LABELS = {
  RECOMMENDED_QUESTION: {
    QST_ID: 'qstId',
    SERVICE_CD: 'serviceCd',
    SERVICE_NM: 'serviceNm',
    DISPLAY_CTNT: 'displayCtnt',
    PROMPT_CTNT: 'promptCtnt',
    QST_CTGR: 'qstCtgr',
    QST_STYLE: 'qstStyle',
    PARENT_ID: 'parentId',
    PARENT_NM: 'parentNm',
    AGE_GRP: 'ageGrp',
    SHOW_U17: 'showU17',
    IMP_START_DATE: 'impStartDate',
    IMP_END_DATE: 'impEndDate',
    STATUS: 'status',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },
} as const;
