// frontend/src/pages/management/common-code/types.ts
import type { CodeType } from '@/mocks/commonCodeDb';

export interface RowItem extends Record<string, unknown> {
  no: number;
  id?: number;
  code_type: CodeType;
  category_nm: string;
  service_cd: string;
  status_code: string;
}
