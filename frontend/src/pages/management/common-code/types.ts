// frontend/src/pages/management/common-code/types.ts

/**
 * 코드그룹 타입 (cm_code_group 테이블)
 */
export interface CodeGroup {
  code_group_id: number; // PK, Auto Inc
  group_code: string; // UK
  group_name: string;
  is_active: number; // tinyint(1): 1=활성, 0=비활성
  created_by: number;
  created_at: string;
  updated_by?: number | null;
  updated_at?: string | null;
  firebaseKey?: string; // Firebase Realtime Database의 자동 생성 키
}

/**
 * 코드아이템 타입 (cm_code_item 테이블)
 */
export interface CodeItem {
  code_item_id: number; // PK, Auto Inc
  code_group_id: number; // FK
  code: string; // 코드 값
  code_name: string; // 코드 표시명
  sort_order: number;
  is_active: number; // tinyint(1): 1=활성, 0=비활성
  created_by: number;
  created_at: string;
  updated_by?: number | null;
  updated_at?: string | null;
  firebaseKey?: string; // Firebase Realtime Database의 자동 생성 키 (예: -OfXToOEqPHkTP2zoA6J)
}

/**
 * 코드 매핑 타입 (cm_code_mapping 테이블)
 */
export interface CodeMapping {
  code_mapping_id: number; // PK, Auto Inc
  mapping_type: string; // 매핑 유형 (예: 'SERVICE_CATEGORY', 'CATEGORY_AGE' 등)
  parent_code_item_id: number; // FK
  child_code_item_id: number; // FK
  sort_order: number;
  is_active: number; // tinyint(1): 1=활성, 0=비활성
  created_by: number;
  created_at: string;
  updated_by?: number | null;
  updated_at?: string | null;
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
  group_code?: string; // 조인해서 가져온 그룹 코드 (UI 편의성)
  group_name?: string; // 조인해서 가져온 그룹명 (UI 편의성)
}

/**
 * 화면 표시용 코드 매핑
 */
export interface CodeMappingDisplay extends CodeMapping {
  no: number; // 화면 표시용 순번
  parent_code?: string; // 부모 코드 값
  parent_code_name?: string; // 부모 코드명
  child_code?: string; // 자식 코드 값
  child_code_name?: string; // 자식 코드명
}

// 하위 호환성을 위한 타입 (기존 코드에서 사용 중)
export type RowItem = CodeItemDisplay;
