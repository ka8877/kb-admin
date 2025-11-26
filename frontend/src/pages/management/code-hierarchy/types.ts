// frontend/src/pages/management/code-hierarchy/types.ts
import type { CodeType } from '@/mocks/commonCodeDb';

export interface RowItem extends Record<string, unknown> {
  no: number;
  id?: number;
  display_no?: number;
  code_type: CodeType;
  category_nm: string;
  service_cd: string;
  status_code: string;
}

/**
 * 계층 구조 정의 타입
 */
export interface HierarchyDefinition {
  id: string;
  parentType: string; // 부모 코드 타입 (예: SERVICE_NAME)
  parentLabel: string; // 부모 표시명 (예: 서비스명)
  childType: string; // 자식 코드 타입 (예: QUESTION_CATEGORY)
  childLabel: string; // 자식 표시명 (예: 질문 카테고리)
  relationField: string; // 관계 필드명 (예: parent_service_cd)
}

/**
 * 범용 코드 아이템 타입
 */
export interface GenericCodeItem {
  no: number;
  code: string; // 실제 코드값
  name: string; // 표시명
  displayYn: string; // 활성 여부
  sortOrder: number;
  codeType: string; // 코드 타입
  parentCode?: string; // 부모 코드 (계층 구조인 경우)
  [key: string]: unknown; // 추가 필드
}
