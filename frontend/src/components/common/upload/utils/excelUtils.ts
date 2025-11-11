// frontend/src/components/common/upload/utils/excelUtils.ts
import ExcelJS from 'exceljs';

/**
 * CSV 라인을 파싱하여 배열로 변환
 * 따옴표 내부의 쉼표는 구분자로 인식하지 않음
 */
export const parseCSVLine = (line: string): string[] => {
  const row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  row.push(current.trim());

  return row;
};

/**
 * 파일로부터 ExcelJS Workbook을 로드
 */
export const loadWorkbookFromFile = async (file: File): Promise<ExcelJS.Workbook> => {
  const workbook = new ExcelJS.Workbook();
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    // CSV 파일을 텍스트로 읽어서 수동으로 파싱
    const text = await file.text();
    const worksheet = workbook.addWorksheet('CSV Data');

    // CSV를 줄 단위로 파싱
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    lines.forEach((line) => {
      const row = parseCSVLine(line);
      worksheet.addRow(row);
    });
  } else {
    await workbook.xlsx.load(await file.arrayBuffer());
  }

  return workbook;
};

/**
 * 행 데이터를 파싱
 */
export const parseRowData = (row: ExcelJS.Row, columnFields: string[]): Record<string, unknown> => {
  const rowData: Record<string, unknown> = {};

  columnFields.forEach((field, colIndex) => {
    const cellValue = row.getCell(colIndex + 1).value;
    rowData[field] = cellValue;
  });

  return rowData;
};

/**
 * 행에 데이터가 있는지 확인
 */
export const hasRowData = (rowData: Record<string, unknown>, columnFields: string[]): boolean => {
  return columnFields.some((field) => {
    const value = rowData[field];
    return value !== null && value !== undefined && String(value).trim() !== '';
  });
};

/**
 * CSV 셀 값을 이스케이프 처리
 */
export const escapeCSVValue = (value: unknown): string => {
  const strValue = String(value ?? '');

  // 쉼표, 따옴표, 줄바꿈이 있으면 따옴표로 감싸기
  if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }

  return strValue;
};
