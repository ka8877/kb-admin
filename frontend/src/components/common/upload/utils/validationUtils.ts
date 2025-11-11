// frontend/src/components/common/upload/utils/validationUtils.ts
import ExcelJS from 'exceljs';
import type { GridColDef } from '@mui/x-data-grid';
import { parseRowData, hasRowData } from './excelUtils';

export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export type ValidationFunction = (
  value: string | number | Date | null | undefined,
  row: Record<string, unknown>,
) => ValidationResult;

export type ValidationError = {
  rowNumber: number;
  message: string;
};

/**
 * 워크시트 데이터 validation
 */
export const validateWorksheetData = (
  worksheet: ExcelJS.Worksheet,
  columns: GridColDef[],
  validationRules: Record<string, ValidationFunction>,
  startRow: number = 4,
): ValidationError | null => {
  const columnFields = columns.map((col) => col.field);
  const lastRow = worksheet.lastRow?.number || startRow - 1;

  // 데이터가 있는 행 수 확인
  if (lastRow < startRow) {
    return {
      rowNumber: 0,
      message: '데이터가 없습니다. 4행부터 데이터를 입력해주세요.',
    };
  }

  // 실제 데이터가 있는 행 개수 추적
  let dataRowCount = 0;

  // 각 행별 validation 체크
  for (let rowNum = startRow; rowNum <= lastRow; rowNum++) {
    const row = worksheet.getRow(rowNum);
    const rowData = parseRowData(row, columnFields);

    // 빈 행은 스킵
    if (!hasRowData(rowData, columnFields)) {
      continue;
    }

    // 데이터가 있는 행 발견
    dataRowCount++;

    // 각 필드별 validation 실행
    for (const [fieldName, validationFn] of Object.entries(validationRules)) {
      const fieldIndex = columnFields.indexOf(fieldName);
      if (fieldIndex === -1) continue;

      const cellValue = rowData[fieldName];
      const validationResult = validationFn(
        cellValue as string | number | Date | null | undefined,
        rowData,
      );

      if (!validationResult.isValid) {
        return {
          rowNumber: rowNum,
          message: validationResult.errorMessage || '유효하지 않은 값입니다',
        };
      }
    }
  }

  // 모든 행을 체크했는데 데이터가 하나도 없으면 에러
  if (dataRowCount === 0) {
    return {
      rowNumber: 0,
      message: '데이터가 없습니다. 4행부터 데이터를 입력해주세요.',
    };
  }

  return null; // validation 통과
};
