// frontend/src/pages/management/common-code/types.ts
import type { CodeType } from '@/mocks/commonCodeDb';

export interface RowItem extends Record<string, unknown> {
  no: number;
  id?: number;
  display_no?: number;
  code_type: CodeType;
  category_nm: string;
  service_cd: string;
  status_code: string;
  parent_service_cd?: string; // 질문 카테고리가 속한 서비스 코드 (ai_search 등)
  service_group_name?: string; // 질문 카테고리의 서비스 그룹명
}
