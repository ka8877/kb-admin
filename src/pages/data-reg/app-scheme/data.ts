import type { SearchField } from '@/types/types';
import dayjs from 'dayjs';
import { FormData } from '@/pages/data-reg/app-scheme/types';
import { statusOptions } from '@/constants/options';
import { TABLE_LABELS } from '@/constants/label';

export const {
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
  LOCKED,
} = TABLE_LABELS.APP_SCHEME;

// **************검색 페이지**************
export const searchFields: SearchField[] = [
  {
    type: 'textGroup',
    fields: [
      { field: PRODUCT_MENU_NAME, label: 'AI 검색 노출 버튼명' },
      { field: DESCRIPTION, label: '앱스킴 설명' },
      { field: GOODS_NAME_LIST, label: '연관 상품/서비스 리스트' },
      { field: PARENT_ID, label: 'MID' },
      { field: PARENT_TITLE, label: 'MID 상품/서비스명' },
    ],
  },

  { field: STATUS, label: '데이터 등록 반영 상태', type: 'select', options: statusOptions },

  /*
  {
    field: 'start',
    dataField: START_DATE,
    label: '노출 시작일시',
    type: 'dateRange',
    position: 'start',
  },
  {
    field: 'end',
    dataField: END_DATE,
    label: '노출 종료일시',
    type: 'dateRange',
    position: 'end',
  }, */
];

// **************상세 페이지**************
// 셀렉트 필드 설정
const selectFieldsConfig = {
  status: statusOptions,
};

// 읽기전용 필드 설정
const readOnlyFieldsConfig = ['no', APP_SCHEME_ID, UPDATED_AT, CREATED_AT];

// 날짜 필드 설정
const dateFieldsConfig = [START_DATE, END_DATE, UPDATED_AT, CREATED_AT];

export { selectFieldsConfig, dateFieldsConfig, readOnlyFieldsConfig };

// 기본값 설정
export const defaultApprovalData: FormData = {
  [PRODUCT_MENU_NAME]: '',
  [DESCRIPTION]: '',
  [APP_SCHEME_LINK]: '',
  [ONE_LINK]: '',
  [GOODS_NAME_LIST]: null,
  [PARENT_ID]: null,
  [PARENT_TITLE]: null,
  [START_DATE]: dayjs().add(30, 'minute'), // 현재 일시 + 30분
  [END_DATE]: dayjs('9999-12-31 00:00'), // 9999-12-31 0시로 초기화
};

// **************엑셀 업로드/다운로드**************
// 엑셀 업로드/다운로드 시 제외할 필드
export const excludeFields = ['no', APP_SCHEME_ID, UPDATED_AT, CREATED_AT, STATUS];

// 엑셀 업로드/다운로드 시 처리할 필드
export const processedFields = [
  PRODUCT_MENU_NAME,
  DESCRIPTION,
  APP_SCHEME_LINK,
  ONE_LINK,
  GOODS_NAME_LIST,
  PARENT_ID,
  PARENT_TITLE,
];

// 필드별 가이드 문구
export const fieldGuides: Record<string, string> = {
  [PRODUCT_MENU_NAME]: '필수 | 200자 이하',
  [DESCRIPTION]: '필수 | 2000자 이하',
  [APP_SCHEME_LINK]: '필수 | URL 형식, 500자 이하',
  [ONE_LINK]: '필수 | URL 형식, 500자 이하',
  [GOODS_NAME_LIST]: '선택 | 200자 이하(AI 금융 계산기 필수)',
  [PARENT_ID]: '선택 | 50자 이하 (예: M020011)',
  [PARENT_TITLE]: '선택 | 200자 이하',
  [START_DATE]: '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초)',
  [END_DATE]: '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초, 노출 시작일시 이후여야 함)',
};

// 예시 데이터 (자동 생성 필드 제외)
export const exampleData = [
  {
    [PRODUCT_MENU_NAME]: 'AI 검색 노출 버튼명 예시',
    [DESCRIPTION]: '앱스킴 설명 예시입니다.',
    [APP_SCHEME_LINK]: 'kakaobank://mini?type=pocket_money_message_card',
    [ONE_LINK]: 'https://kakaobank.onelink.me/4YTm/crdkrh44',
    [GOODS_NAME_LIST]: '26주적금',
    [PARENT_ID]: 'M020011',
    [PARENT_TITLE]: '이체/출금',
    [START_DATE]: '20250501235959',
    [END_DATE]: '99991231235959',
  },
];

// 날짜 필드 설정
export const excelDateFieldsConfig = [START_DATE, END_DATE];
