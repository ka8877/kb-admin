import type { SearchField } from '@/types/types';
import { categoryMockDb } from '@/mocks/commonCodeDb';
import { statusOptions, yesNoOptions } from '@/constants/options';
import { TABLE_LABELS } from '@/constants/label';
import { COMMON_CODE } from '@/constants/commonCode';

export const {
  QST_ID,
  SERVICE_CD,
  SERVICE_NM,
  QST_CTGR,
  DISPLAY_CTNT,
  PROMPT_CTNT,
  QST_STYLE,
  PARENT_ID,
  PARENT_NM,
  AGE_GRP,
  SHOW_U17,
  IMP_START_DATE,
  IMP_END_DATE,
  STATUS,
  CREATED_AT,
  UPDATED_AT,
} = TABLE_LABELS.RECOMMENDED_QUESTION;

// **************공통 코드 옵션 데이터 **************
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
      { label: 'mid (엔어드민아이디)', value: COMMON_CODE.QST_CTGR.AI_SEARCH_MID },
      { label: 'story (돈이뭔놈이야기)', value: COMMON_CODE.QST_CTGR.AI_SEARCH_STORY },
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

// **************상세 페이지**************
// 공통 코드 셀렉트 필드 설정
export const selectFieldsConfig = {
  [SERVICE_NM]: serviceOptions,
  [AGE_GRP]: ageGroupOptions,
  [SHOW_U17]: yesNoOptions,
  [STATUS]: statusOptions,
  [QST_CTGR]: questionCategoryOptions,
};

// 동적으로 로드된 옵션으로 셀렉트 필드 설정 생성
export const createSelectFieldsConfig = (options: {
  serviceOptions: Array<{ label: string; value: string }>;
  ageGroupOptions: Array<{ label: string; value: string }>;
}) => ({
  [SERVICE_NM]: options.serviceOptions,
  [AGE_GRP]: options.ageGroupOptions,
  [SHOW_U17]: yesNoOptions,
  [STATUS]: statusOptions,
  [QST_CTGR]: questionCategoryOptions,
});

// 날짜 필드 설정
export const dateFieldsConfig = [IMP_START_DATE, IMP_END_DATE, UPDATED_AT, CREATED_AT];

// 읽기 전용 필드 설정
export const readOnlyFieldsConfig = ['no', QST_ID, UPDATED_AT, CREATED_AT];

// 변경 체크에서 제외할 필드 설정
export const excludeFieldsFromChangeCheckConfig = [UPDATED_AT, CREATED_AT, 'no', QST_ID];

// 데이터등록반영상태 제외 필드 설정
export const excludeFields = ['no', QST_ID, UPDATED_AT, CREATED_AT, STATUS];

// 기본 필수 필드 설정
export const baseRequiredFieldsConfig = [
  SERVICE_NM,
  QST_CTGR,
  DISPLAY_CTNT,
  SHOW_U17,
  IMP_START_DATE,
  IMP_END_DATE,
];

// 조건적 필수 필드 관련 상수
export const CONDITIONAL_REQUIRED_FIELDS = {
  // 질문 카테고리 값
  QST_CTGR_AI_SEARCH_MID: COMMON_CODE.QST_CTGR.AI_SEARCH_MID,
  QST_CTGR_AI_SEARCH_STORY: COMMON_CODE.QST_CTGR.AI_SEARCH_STORY,
  // 서비스명 값
  SERVICE_AI_CALC: COMMON_CODE.SERVICE_CODE.AI_CALC,
  // 필드명
  PARENT_ID: PARENT_ID,
  PARENT_NM: PARENT_NM,
  AGE_GRP: AGE_GRP,
} as const;

// 조건부 필수 필드 설정
// qstCtgr가 'ai_search_mid' 또는 'ai_search_story'일 때 필수인 필드
export const conditionalRequiredFieldsForQuestionCategory = [
  CONDITIONAL_REQUIRED_FIELDS.PARENT_ID,
  CONDITIONAL_REQUIRED_FIELDS.PARENT_NM,
];

// serviceNm이 'ai_calc'일 때 필수인 필드
export const conditionalRequiredFieldsForService = [CONDITIONAL_REQUIRED_FIELDS.AGE_GRP];

// **************검색 페이지**************
// searchFields는 hooks/useSearchFields로 이동됨

// **************엑셀 업로드/다운로드 페이지**************/
// 필드별 가이드 메시지 (필요한 필드만)
export const fieldGuides: Record<string, string> = {
  [SERVICE_CD]: '필수 | 참조 데이터 확인 (ai_search, ai_calc, ai_transfer, ai_shared_account)',
  [DISPLAY_CTNT]: '필수 | 5-500자',
  [PROMPT_CTNT]: '선택 | 1000자 이하',
  [QST_CTGR]: '필수 | 참조 데이터 확인',
  [QST_STYLE]: '선택 | 질문 관련 태그나 스타일',
  [PARENT_ID]: '조건부 필수 | AI 검색 mid/story인 경우 필수 (예: M020011)',
  [PARENT_NM]: '조건부 필수 | AI 검색 mid/story인 경우 필수',
  [AGE_GRP]: '조건부 필수 | AI 금융계산기인 경우 필수, 참조 데이터 확인 (10, 20, 30, 40, 50)',
  [SHOW_U17]: '필수 | Y 또는 N',
  [IMP_START_DATE]: '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초)',
  [IMP_END_DATE]:
    '필수 | 20251125000000 형식 (14자리 숫자: 연월일시분초, 노출 시작일시 이후여야 함)',
};

// 예시 데이터 (자동 생성 필드 제외)
export const exampleData = [
  {
    [SERVICE_CD]: 'ai_search',
    [DISPLAY_CTNT]: '하루만 맡겨도 연 2% 받을 수 있어?',
    [PROMPT_CTNT]: '적금 상품의 금리 정보를 알려주세요',
    [QST_CTGR]: COMMON_CODE.QST_CTGR.AI_SEARCH_MID,
    [QST_STYLE]: '적금, 금리',
    [PARENT_ID]: 'M020011',
    [PARENT_NM]: '26주 적금',
    [AGE_GRP]: 10,
    [SHOW_U17]: 'N',
    [IMP_START_DATE]: '20251125000000',
    [IMP_END_DATE]: '99991231000000',
  },
];

// 날짜 필드 설정
export const excelDateFieldsConfig = [IMP_START_DATE, IMP_END_DATE];

export const excelExcludeFields = [QST_ID, UPDATED_AT, CREATED_AT, STATUS];

// 엑셀 참조 데이터 (deprecated: useExcelReferenceData hook instead)
export const excelReferenceData = {
  서비스코드: serviceOptions,
  연령대: ageGroupOptions,
  '17세미만노출여부': yesNoOptions,
  질문카테고리: questionCategoryOptions,
};
