import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import type { ValidationFunction } from './utils/validationUtils';
import type { ReferenceData } from './utils/templateGenerators';
import type { ValidationResult } from '@/types/types';

export type { ValidationFunction, ReferenceData };

export type ExcelUploadProps<T extends GridValidRowModel = GridValidRowModel> = {
  onSave: (data: T[]) => void;
  onCancel: () => void;
  columns?: GridColDef<T>[]; // 템플릿 생성용 컬럼 (no 제외)
  gridColumns?: GridColDef<T>[]; // 그리드 표시용 컬럼 (no 포함)
  templateFileName?: string;
  exampleData?: Record<string, unknown>[];
  fieldGuides?: Record<string, string>;
  validationRules?: Record<string, ValidationFunction>;
  referenceData?: ReferenceData;
  acceptedFormats?: string[];
  title?: string;
  description?: string;
  templateLabel?: string;
  onTemplateDownload?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  // ExcelListPreview 관련 props
  rowIdGetter?: keyof T | ((row: T) => string | number);
  readOnlyFields?: string[];
  selectFields?: Record<string, Array<{ label: string; value: string }>>;
  dateFields?: string[];
  dateFormat?: string;
  validator?: (data: T) => Record<string, ValidationResult>;
  getDynamicSelectOptions?: (row: T) => Array<{ label: string; value: string }>;
  dynamicSelectFields?: string[]; // 동적 셀렉트를 적용할 필드 목록
  onProcessRowUpdate?: (newRow: T, oldRow: T) => T;
  rowSanitizer?: (newRow: T, oldRow: T) => T; // onProcessRowUpdate와 동일한 역할 (alias)
  getRequiredFields?: (row: T) => string[];
  /**
   * 저장 전 추가 유효성 검사 (예: 중복 체크)
   * 문자열을 반환하면 alert을 띄우고 저장을 중단함
   * null을 반환하면 저장 진행 (confirm 창 표시)
   */
  preSaveCheck?: (data: T[]) => string | null;
};
