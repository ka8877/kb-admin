import type { RecommendedQuestionItem } from './types';
import type { ApprovalRequestItem, SearchField } from '@/types/types';
import { categoryMockDb } from '@/mocks/commonCodeDb';
import { APPROVAL_FORM_OPTIONS, APPROVAL_STATUS_OPTIONS } from '@/constants/options';

// 서비스 옵션 데이터 (Mock DB에서 동적으로 로드 가능하도록 함수로 변경)
export const loadServiceOptions = async () => {
  const services = await categoryMockDb.getServiceNames();
  return services
    .filter((s) => s.display_yn === 'Y')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => ({ label: s.service_nm, value: s.service_cd }));
};

// 정적 서비스 옵션 (기존 코드 호환성 유지)
export const serviceOptions = [
  { label: 'AI 검색', value: 'ai_search' },
  { label: 'AI 금융계산기', value: 'ai_calc' },
  { label: 'AI 이체', value: 'ai_transfer' },
  { label: 'AI 모임총무', value: 'ai_shared_account' },
];

// 연령대 옵션 데이터 (Mock DB에서 동적으로 로드 가능하도록 함수로 변경)
export const loadAgeGroupOptions = async () => {
  const ageGroups = await categoryMockDb.getAgeGroups();
  return ageGroups
    .filter((a) => a.display_yn === 'Y')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((a) => ({ label: a.age_grp_nm, value: a.age_grp_cd }));
};

// 정적 연령대 옵션 (기존 코드 호환성 유지)
export const ageGroupOptions = [
  { label: '10대', value: '10' },
  { label: '20대', value: '20' },
  { label: '30대', value: '30' },
  { label: '40대', value: '40' },
  { label: '50대', value: '50' },
];

// 17세 미만 노출 여부 옵션 데이터
export const under17Options = [
  { label: '예', value: 'Y' },
  { label: '아니오', value: 'N' },
];

// 데이터 등록 반영 상태 옵션 데이터
export const statusOptions = [
  { label: '서비스 중', value: 'in_service' },
  { label: '서비스 종료', value: 'out_of_service' },
];

// 질문 카테고리 옵션 데이터 (Mock DB에서 동적으로 로드 가능하도록 함수로 변경)
export const loadQuestionCategoryGroupedOptions = async () => {
  const services = await categoryMockDb.getServiceNames();
  const categories = await categoryMockDb.getQuestionCategories();

  return services
    .filter((s) => s.display_yn === 'Y')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((service) => ({
      groupLabel: service.service_nm,
      groupValue: service.service_cd,
      options: categories
        .filter((c) => c.service_cd === service.service_cd && c.display_yn === 'Y')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => ({
          label: c.qst_ctgr_nm,
          value: c.qst_ctgr_cd,
        })),
    }))
    .filter((group) => group.options.length > 0);
};

// 질문 카테고리 옵션 데이터 (그룹화된 버전 - ManagementList에서 사용)
export const questionCategoryGroupedOptions = [
  {
    groupLabel: 'AI 검색',
    groupValue: 'ai_search',
    options: [
      { label: 'mid (엔어드민아이디)', value: 'ai_search_mid' },
      { label: 'story (돈이뭔놈이야기)', value: 'ai_search_story' },
      { label: 'child (아동보호)', value: 'ai_search_child' },
      { label: 'promo (프로모션)', value: 'ai_search_promo' },
      { label: 'signature (시그니처)', value: 'ai_search_signature' },
    ],
  },
  {
    groupLabel: 'AI 금융계산기',
    groupValue: 'ai_calc',
    options: [
      { label: 'save (저축)', value: 'ai_calc_save' },
      { label: 'loan (대출)', value: 'ai_calc_loan' },
      { label: 'exchange (환율)', value: 'ai_calc_exchange' },
    ],
  },
  {
    groupLabel: 'AI 이체',
    groupValue: 'ai_transfer',
    options: [
      { label: 'svc_intro', value: 'ai_transfer_svc_intro' },
      { label: 'trn_nick', value: 'ai_transfer_trn_nick' },
      { label: 'sec_auth', value: 'ai_transfer_sec_auth' },
      { label: 'mstk_trn', value: 'ai_transfer_mstk_trn' },
    ],
  },
  {
    groupLabel: 'AI 모임총무',
    groupValue: 'ai_shared_account',
    options: [
      { label: 'DUES_STATUS', value: 'ai_shared_dues_status' },
      { label: 'DUES_RECORD', value: 'ai_shared_dues_record' },
      { label: 'DUES_ANALYSIS', value: 'ai_shared_dues_analysis' },
      { label: 'EXPENSE_OVERVIEW', value: 'ai_shared_expense_overview' },
      { label: 'EXPENSE_ANALYSIS', value: 'ai_shared_expense_analysis' },
      { label: 'MOIM_DUES_STATUS', value: 'ai_shared_moim_dues_status' },
      { label: 'MOIM_DUES_RECORD', value: 'ai_shared_moim_dues_record' },
    ],
  },
];

// 질문 카테고리 옵션 (평탄화된 버전 - DataDetail에서 사용)
export const questionCategoryOptions = questionCategoryGroupedOptions.flatMap(
  (group) => group.options,
);

export const mockRecommendedQuestions: RecommendedQuestionItem[] = [
  {
    no: 560,
    qst_id: '1',
    service_nm: 'ai_search',
    display_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
    prompt_ctnt: '적금 상품의 금리 정보를 알려주세요',
    qst_ctgr: 'ai_search_mid',
    qst_style: '적금, 금리',
    parent_id: 'M020011',
    parent_nm: '26주 적금',
    age_grp: '30',
    under_17_yn: 'N',
    imp_start_date: '20250401235959',
    imp_end_date: '99991231235959',
    updatedAt: '20250601235959',
    registeredAt: '20250601235959',
    status: 'in_service',
  },
  {
    no: 561,
    qst_id: '2',
    service_nm: 'ai_calc',
    display_ctnt: '지금 가입하면 혜택이 있나요?',
    prompt_ctnt: '대출 가입 시 제공되는 혜택을 알려주세요',
    qst_ctgr: 'ai_calc_loan',
    qst_style: '대출, 혜택',
    parent_id: null,
    parent_nm: null,
    age_grp: '40',
    under_17_yn: 'N',
    imp_start_date: '20250401235959',
    imp_end_date: '20251231235959',
    updatedAt: '20250601235959',
    registeredAt: '20250601235959',
    status: 'out_of_service',
  },
  {
    no: 562,
    qst_id: '3',
    service_nm: 'ai_search',
    display_ctnt: '모바일에서도 동일한 혜택을 받을 수 있나요?',
    prompt_ctnt: null,
    qst_ctgr: 'ai_search_story',
    qst_style: '모바일, 혜택',
    parent_id: 'M020012',
    parent_nm: '12개월 적금',
    age_grp: '20',
    under_17_yn: 'Y',
    imp_start_date: '20250401235959',
    imp_end_date: '20250630235959',
    updatedAt: '20250415235959',
    registeredAt: '20250415235959',
    status: 'in_service',
  },
];

// 결재 요청 샘플 데이터
export const mockApprovalRequests: ApprovalRequestItem[] = [
  {
    no: 1,
    id: 'req_001',
    approval_form: '데이터 등록',
    title: '추천질문 등록 요청합니다',
    content: '추천질문 AI_검색 관련하여 등록합니다..',
    requester: 'jasmin.t',
    department: '대화형 AI 서비스',
    request_date: '2025.06.17. 00:00:00',
    status: '요청',
    process_date: '2025.06.17. 00:00:00',
  },
  {
    no: 2,
    id: 'req_002',
    approval_form: '데이터 수정',
    title: '추천질문 수정 요청드립니다',
    content: 'AI 계산기 서비스 관련 질문 내용을 수정하고자 합니다.',
    requester: 'john.kim',
    department: '데이터 관리팀',
    request_date: '2025.06.16. 14:30:00',
    status: '검토중',
    process_date: '2025.06.16. 15:00:00',
  },
  {
    no: 3,
    id: 'req_003',
    approval_form: '데이터 삭제',
    title: '불필요한 추천질문 삭제 요청',
    content: '서비스 종료로 인한 관련 질문들을 일괄 삭제 요청합니다.',
    requester: 'sarah.lee',
    department: '서비스 기획팀',
    request_date: '2025.06.15. 09:15:00',
    status: '승인완료',
    process_date: '2025.06.15. 16:45:00',
  },
];

// 결재 요청 상세 - 추천 질문 샘플 데이터
export const mockApprovalDetailQuestions: RecommendedQuestionItem[] = [
  {
    no: 1,
    qst_id: 'Q001',
    service_nm: 'ai_transfer',
    display_ctnt: 'AI 이체 보안 인증은 어떻게 진행돼?',
    prompt_ctnt: 'AI 이체 서비스의 보안 인증 절차를 설명해주세요',
    qst_ctgr: 'ai_transfer_sec_auth',
    qst_style: '이체, 보안',
    parent_id: 'TRN_001',
    parent_nm: 'AI 이체 안내',
    age_grp: '30',
    under_17_yn: 'N',
    imp_start_date: '2025.06.17. 00:00:00',
    imp_end_date: '2025.12.31. 23:59:59',
    updatedAt: '2025.06.17. 14:30:00',
    registeredAt: '2025.06.17. 14:30:00',
    status: 'in_service',
  },
  {
    no: 2,
    qst_id: 'Q002',
    service_nm: 'ai_calc',
    display_ctnt: '투자 상품 추천해줘',
    prompt_ctnt: '고객 맞춤 투자 상품을 추천해주세요',
    qst_ctgr: 'ai_calc_save',
    qst_style: '투자, 저축',
    parent_id: null,
    parent_nm: null,
    age_grp: '20',
    under_17_yn: 'N',
    imp_start_date: '2025.06.17. 00:00:00',
    imp_end_date: '2025.12.31. 23:59:59',
    updatedAt: '2025.06.17. 15:00:00',
    registeredAt: '2025.06.17. 15:00:00',
    status: 'in_service',
  },
];

// 상세 페이지 샘플 데이터
export const mockRecommendedQuestionDetail: RecommendedQuestionItem = {
  no: 560,
  qst_id: '1',
  service_nm: 'ai_search',
  display_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
  prompt_ctnt: '적금 상품의 금리 정보를 알려주세요',
  qst_ctgr: 'ai_search_mid',
  qst_style: '적금, 금리',
  parent_id: 'M020011',
  parent_nm: '26주 적금',
  age_grp: '30',
  under_17_yn: 'N',
  imp_start_date: '20250501235959',
  imp_end_date: '20251231235959',
  updatedAt: '20250617150000',
  registeredAt: '20250617150000',
  status: 'in_service',
};

export const searchFields: SearchField[] = [
  {
    type: 'textGroup',
    fields: [
      { field: 'display_ctnt', label: '질문내용' },
      { field: 'qst_style', label: '질문스타일' },
    ],
  },
  { field: 'service_nm', label: '서비스명', type: 'select', options: serviceOptions },

  { field: 'qst_ctgr', label: '질문카테고리', type: 'select', options: questionCategoryOptions },
  { field: 'status', label: '데이터등록반영상태', type: 'select', options: statusOptions },
  { field: 'age_grp', label: '연령대', type: 'select', options: ageGroupOptions },
  { field: 'under_17_yn', label: '17세 미만 여부', type: 'radio', options: under17Options },
  {
    field: 'imp_start',
    dataField: 'imp_start_date',
    label: '노출시작일시',
    type: 'dateRange',
    position: 'start',
  },
  {
    field: 'imp_end',
    dataField: 'imp_end_date',
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
