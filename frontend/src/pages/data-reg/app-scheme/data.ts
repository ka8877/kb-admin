import type { SearchField } from '@/types/types';
import { APPROVAL_FORM_OPTIONS, APPROVAL_STATUS_OPTIONS } from '@/constants/options';
import dayjs from 'dayjs';
import { FormData } from '@/pages/data-reg/app-scheme/types';
import { statusOptions } from '@/constants/options';

// **************검색 페이지**************
export const searchFields: SearchField[] = [
  {
    type: 'textGroup',
    fields: [
      { field: 'productMenuName', label: 'AI검색 노출버튼명' },
      { field: 'description', label: '앱스킴 설명' },
      { field: 'goodsNameList', label: '연관 상품/서비스 리스트' },
      { field: 'parentId', label: 'MID' },
      { field: 'parentTitle', label: 'MID 상품/서비스명' },
    ],
  },

  { field: 'status', label: '데이터등록반영상태', type: 'select', options: statusOptions },

  {
    field: 'start',
    dataField: 'startDate',
    label: '노출시작일시',
    type: 'dateRange',
    position: 'start',
  },
  {
    field: 'end',
    dataField: 'endDate',
    label: '노출종료일시',
    type: 'dateRange',
    position: 'end',
  },
];

// **************상세 페이지**************
// 셀렉트 필드 설정
const selectFieldsConfig = {
  status: statusOptions,
};

// 읽기전용 필드 설정
const readOnlyFieldsConfig = ['no', 'appSchemeId', 'updatedAt', 'createdAt'];

// 날짜 필드 설정
const dateFieldsConfig = ['startDate', 'endDate', 'updatedAt', 'createdAt'];

export { selectFieldsConfig, dateFieldsConfig, readOnlyFieldsConfig };

// 기본값 설정
export const defaultApprovalData: FormData = {
  productMenuName: '',
  description: '',
  appSchemeLink: '',
  oneLink: '',
  goodsNameList: null,
  parentId: null,
  parentTitle: null,
  startDate: dayjs().add(30, 'minute'), // 현재 일시 + 30분
  endDate: dayjs('9999-12-31 00:00'), // 9999-12-31 0시로 초기화
};

// **************엑셀 업로드/다운로드**************
// 엑셀 업로드/다운로드 시 제외할 필드
export const excludeFields = ['no', 'appSchemeId', 'updatedAt', 'createdAt', 'status'];

// 엑셀 업로드/다운로드 시 처리할 필드
export const processedFields = [
  'productMenuName',
  'description',
  'appSchemeLink',
  'oneLink',
  'goodsNameList',
  'parentId',
  'parentTitle',
];

// 필드별 가이드 문구
export const fieldGuides: Record<string, string> = {
  productMenuName: '필수 | 200자 이하',
  description: '필수 | 2000자 이하',
  appSchemeLink: '필수 | URL 형식, 500자 이하',
  oneLink: '필수 | URL 형식, 500자 이하',
  goodsNameList: '선택 | 200자 이하',
  parentId: '선택 | 50자 이하 (예: M020011)',
  parentTitle: '선택 | 200자 이하',
  startDate: '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초)',
  endDate: '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초, 노출시작일시 이후여야 함)',
};

// 예시 데이터 (자동 생성 필드 제외)
export const exampleData = [
  {
    productMenuName: 'AI 검색 노출버튼명 예시',
    description: '앱스킴설명 예시입니다.',
    appSchemeLink: 'https://appscheme.to/abcd',
    oneLink: 'https://onelink.to/abcd',
    goodsNameList: '자유적금, 햇살론 15',
    parentId: 'M020011',
    parentTitle: '26주 적금',
    startDate: '20250501235959',
    endDate: '99991231235959',
  },
];

// 날짜 필드 설정
export const excelDateFieldsConfig = ['startDate', 'endDate'];
