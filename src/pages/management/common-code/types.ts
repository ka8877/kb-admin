// frontend/src/pages/management/common-code/types.ts

/**
 * 코드그룹 API 응답 타입 (cm_code_group 테이블)
 * API spec 5) 공통코드 섹션 참조
 */
export interface CodeGroup {
  codeGroupId: number; // PK
  groupCode: string; // UK
  groupName: string;
  isActive: boolean;
}

/**
 * 코드아이템 API 응답 타입 (cm_code_item 테이블)
 * API spec 5) 공통코드 섹션 참조
 */
export interface CodeItem {
  codeItemId: number; // PK
  code: string; // 코드 값
  codeName: string; // 코드 표시명
  sortOrder: number;
  isActive: boolean;
}

/**
 * 화면 표시용 코드그룹 (대분류)
 */
export interface CodeGroupDisplay extends CodeGroup {
  no: number; // 화면 표시용 순번
}

/**
 * 화면 표시용 코드아이템 (소분류)
 */
export interface CodeItemDisplay extends CodeItem {
  no: number; // 화면 표시용 순번
  groupCode?: string; // 조인해서 가져온 그룹 코드 (UI 편의성)
  groupName?: string; // 조인해서 가져온 그룹명 (UI 편의성)
}

// 하위 호환성을 위한 타입 (기존 코드에서 사용 중)
export type RowItem = CodeItemDisplay;

/**
 * 서비스별 질문 카테고리 매핑 정보
 * API spec 6) 공통코드 매핑 참조
 */
export interface ServiceCategoryMappingItem extends CodeItem {
  mappingSortOrder: number;
}

/**
 * 서비스별 질문 카테고리 전체 정보
 */
export interface ServiceQstCategoriesInfo {
  serviceCodeItemId: number;
  serviceCd: string;
  serviceName: string;
  qstCategories: ServiceCategoryMappingItem[];
}

// 레거시 매핑 타입들 (Firebase 기반, 하위 호환성을 위해 유지)
export interface ServiceMapping {
  code_mapping_id: number;
  mapping_type: 'SERVICE';
  parent_code_item_id: string | number;
  child_code_item_id: string | number;
  sort_order: number;
  is_active: number;
  created_by: number;
  created_at: string;
  updated_by?: number | null;
  updated_at?: string | null;
  firebaseKey?: string;
}

export interface QuestionMapping {
  code_mapping_id: number;
  mapping_type: 'QUESTION';
  parent_code_item_id: string | number;
  child_code_item_id: string | number;
  sort_order: number;
  is_active: number;
  created_by: number;
  created_at: string;
  updated_by?: number | null;
  updated_at?: string | null;
  firebaseKey?: string;
}

export interface ServiceMappingDisplay extends ServiceMapping {
  no: number;
  parent_code?: string;
  parent_code_name?: string;
  child_code?: string;
  child_code_name?: string;
}

export interface QuestionMappingDisplay extends QuestionMapping {
  no: number;
  parent_code?: string;
  parent_code_name?: string;
  child_code?: string;
  child_code_name?: string;
}
