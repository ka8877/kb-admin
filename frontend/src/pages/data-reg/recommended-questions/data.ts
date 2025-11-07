import type { RecommendedQuestionItem, ApprovalRequestItem } from './types';

// 서비스 옵션 데이터
export const serviceOptions = [
  { label: 'AI 검색', value: 'ai_search' },
  { label: 'AI 금융계산기', value: 'ai_calc' },
  { label: 'AI 이체', value: 'ai_transfer' },
  { label: 'AI 모임총무', value: 'ai_shared_account' },
];

// 연령대 옵션 데이터
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

// 질문 카테고리 옵션 데이터
export const questionCategoryOptions = [
  {
    groupLabel: 'AI검색',
    options: [
      { label: 'mid (엔어드민아이디)', value: 'ai_search_mid' },
      { label: 'story (돈이뭔놈이야기)', value: 'ai_search_story' },
      { label: 'child (아동보호)', value: 'ai_search_child' },
      { label: 'promo (프로모션)', value: 'ai_search_promo' },
      { label: 'signature (시그니처)', value: 'ai_search_signature' },
    ],
  },
  {
    groupLabel: 'AI금융계산기',
    options: [
      { label: 'save (저축)', value: 'ai_calc_save' },
      { label: 'loan (대출)', value: 'ai_calc_loan' },
      { label: 'exchange (환율)', value: 'ai_calc_exchange' },
    ],
  },
  {
    groupLabel: 'AI이체',
    options: [
      { label: 'svc_intro', value: 'ai_transfer_svc_intro' },
      { label: 'trn_nick', value: 'ai_transfer_trn_nick' },
      { label: 'sec_auth', value: 'ai_transfer_sec_auth' },
      { label: 'mstk_trn', value: 'ai_transfer_mstk_trn' },
    ],
  },
  {
    groupLabel: 'AI모임총무',
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

export const mockRecommendedQuestions: RecommendedQuestionItem[] = [
  {
    no: 560,
    qst_id: '1',
    service_nm: 'AI 검색',
    qst_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
    parent_id: 'M020011',
    parent_nm: '26주 적금',
    imp_start_date: '20250501235959',
    imp_end_date: '99991231235959',
    updatedAt: '202501235959',
    registeredAt: '202501235959',
    status: 'in_service',
  },
  {
    no: 561,
    qst_id: '2',
    service_nm: 'AI 추천',
    qst_ctnt: '지금 가입하면 혜택이 있나요?',
    parent_id: null,
    parent_nm: null,
    imp_start_date: '20250601235959',
    imp_end_date: '20251231235959',
    updatedAt: '20250601235959',
    registeredAt: '20250601235959',
    status: 'out_of_service',
  },
  {
    no: 562,
    qst_id: '3',
    service_nm: 'AI 검색',
    qst_ctnt: '모바일에서도 동일한 혜택을 받을 수 있나요?',
    parent_id: 'M020012',
    parent_nm: '12개월 적금',
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
    service_nm: 'AI 검색',
    qst_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
    parent_id: 'M020011',
    parent_nm: '대출 문의',
    imp_start_date: '2025.06.17. 00:00:00',
    imp_end_date: '2025.12.31. 23:59:59',
    updatedAt: '2025.06.17. 14:30:00',
    registeredAt: '2025.06.17. 14:30:00',
    status: 'in_service',
  },
  {
    no: 2,
    qst_id: 'Q002',
    service_nm: 'AI 계산기',
    qst_ctnt: '투자 상품 추천해줘',
    parent_id: null,
    parent_nm: null,
    imp_start_date: '2025.06.17. 00:00:00',
    imp_end_date: '2025.12.31. 23:59:59',
    updatedAt: '2025.06.17. 15:00:00',
    registeredAt: '2025.06.17. 15:00:00',
    status: 'in_service',
  },
];
