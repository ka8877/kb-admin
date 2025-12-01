import type { AppSchemeItem } from './types';
import type { ApprovalRequestItem, SearchField } from '@/types/types';
import { APPROVAL_FORM_OPTIONS, APPROVAL_STATUS_OPTIONS } from '@/constants/options';

// 데이터 등록 반영 상태 옵션 데이터
export const statusOptions = [
  { label: '서비스 중', value: 'in_service' },
  { label: '서비스 종료', value: 'out_of_service' },
];

export const mockAppSchemes: AppSchemeItem[] = [
  {
    no: 560,
    id: '1',
    product_menu_name: 'AI 검색 노출버튼명 예시',
    description: '앱스킴설명 예시입니다.',
    app_scheme_link: 'https://appscheme.to/abcd',
    one_link: 'https://onelink.to/abcd',
    goods_name_list: '자유적금, 햇살론 15',
    parent_id: 'M020011',
    parent_title: '26주 적금',
    start_date: '20250401235959',
    end_date: '99991231235959',
    updatedAt: '20250601235959',
    registeredAt: '20250601235959',
    status: 'in_service',
  },
  {
    no: 561,
    id: '2',
    product_menu_name: 'AI 대출 추천',
    description: '대출 상품 추천용 앱스킴',
    app_scheme_link: 'https://appscheme.to/loan',
    one_link: 'https://onelink.to/loan',
    goods_name_list: '햇살론, 사잇돌대출',
    parent_id: 'L010001',
    parent_title: '햇살론',
    start_date: '20250501000000',
    end_date: '20251231235959',
    updatedAt: '20250610120000',
    registeredAt: '20250610120000',
    status: 'in_service',
  },
  {
    no: 562,
    id: '3',
    product_menu_name: 'AI 보험 안내',
    description: '보험 관련 앱스킴',
    app_scheme_link: 'https://appscheme.to/insure',
    one_link: 'https://onelink.to/insure',
    goods_name_list: '실손보험, 암보험',
    parent_id: 'I020002',
    parent_title: '실손보험',
    start_date: '20250601000000',
    end_date: '20251231235959',
    updatedAt: '20250615100000',
    registeredAt: '20250615100000',
    status: 'out_of_service',
  },
  {
    no: 563,
    id: '4',
    product_menu_name: 'AI 카드 혜택',
    description: '카드 혜택 안내 앱스킴 카드 혜택 안내 앱스킴 카드 혜택 안내 앱스킴 카드 혜택 안내 앱스킴',
    app_scheme_link: 'https://appscheme.to/card',
    one_link: 'https://onelink.to/card',
    goods_name_list: '신용카드, 체크카드',
    parent_id: 'C030003',
    parent_title: '신용카드',
    start_date: '20250701000000',
    end_date: '20251231235959',
    updatedAt: '20250701100000',
    registeredAt: '20250701100000',
    status: 'in_service',
  },
  {
    no: 564,
    id: '5',
    product_menu_name: 'AI 환율 안내',
    description: '환율 정보 제공 앱스킴',
    app_scheme_link: 'https://appscheme.to/fx',
    one_link: 'https://onelink.to/fx',
    goods_name_list: '환전, 외화예금',
    parent_id: 'F040004',
    parent_title: '환전',
    start_date: '20250801000000',
    end_date: '20251231235959',
    updatedAt: '20250801100000',
    registeredAt: '20250801100000',
    status: 'in_service',
  },
];

// 결재 요청 샘플 데이터
export const mockApprovalRequests: ApprovalRequestItem[] = [
  {
    no: 1,
    id: 'req_001',
    approval_form: '데이터 등록',
    title: '앱스킴 등록 요청합니다',
    content: '앱스킴 AI_검색 관련하여 등록합니다..',
    requester: 'jasmin.t',
    department: '대화형 AI 서비스',
    request_date: '2025.06.17. 00:00:00',
    status: '요청',
    process_date: '2025.06.17. 00:00:00',
  },
];

// 상세 페이지 샘플 데이터
export const mockAppSchemeDetail: AppSchemeItem = {
  no: 560,
  id: '1',
  product_menu_name: 'AI 검색 노출버튼명 예시',
  description: '앱스킴설명 예시입니다.',
  app_scheme_link: 'https://appscheme.to/abcd',
  one_link: 'https://onelink.to/abcd',
  goods_name_list: '자유적금, 햇살론 15',
  parent_id: 'M020011',
  parent_title: '26주 적금',
  start_date: '20250401235959',
  end_date: '99991231235959',
  updatedAt: '20250601235959',
  registeredAt: '20250601235959',
  status: 'in_service',
};

export const searchFields: SearchField[] = [
  {
    type: 'textGroup',
    fields: [
      { field: 'product_menu_name', label: 'AI검색 노출버튼명' },
      { field: 'description', label: '앱스킴 설명' },
      { field: 'goods_name_list', label: '연관 상품/서비스 리스트' },
      { field: 'parent_id', label: 'MID' },
      { field: 'parent_title', label: 'MID 상품/서비스명' },
    ],
  },

  { field: 'status', label: '데이터등록반영상태', type: 'select', options: statusOptions },

  {
    field: 'start',
    dataField: 'start_date',
    label: '노출시작일시',
    type: 'dateRange',
    position: 'start',
  },
  {
    field: 'end',
    dataField: 'end_date',
    label: '노출종료일시',
    type: 'dateRange',
    position: 'end',
  },
];

export const approvalSearchFields: SearchField[] = [
  {
    type: 'textGroup',
    fields: [
      { field: 'title', label: '제목' },
      { field: 'content', label: '내용' },
    ],
  },
  {
    field: 'approval_form',
    label: '결재양식',
    type: 'select',
    options: [...APPROVAL_FORM_OPTIONS],
  },
  {
    field: 'status',
    label: '결재상태',
    type: 'select',
    options: [...APPROVAL_STATUS_OPTIONS],
  },

  {
    field: 'request_date_start',
    dataField: 'request_date',
    label: '요청일시 시작',
    type: 'dateRange',
    position: 'start',
  },
  {
    field: 'request_date_end',
    dataField: 'request_date',
    label: '요청일시 종료',
    type: 'dateRange',
    position: 'end',
  },
];

const selectFieldsConfig = {
  status: statusOptions,
};

const readOnlyFieldsConfig = ['no', 'id', 'updatedAt', 'registeredAt'];

const dateFieldsConfig = ['start_date', 'end_date', 'updatedAt', 'registeredAt'];

export { selectFieldsConfig, dateFieldsConfig, readOnlyFieldsConfig };





