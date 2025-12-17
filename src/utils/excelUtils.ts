import ExcelJS from 'exceljs';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';

/**
 * DataGrid/ManagementList에서 사용 가능한 공통 엑셀 내보내기 유틸
 */
export type GridExportFormatter<T extends GridValidRowModel = GridValidRowModel> = (
  col: GridColDef<T>,
) => GridColDef<T>;

export type ExportGridToExcelParams<T extends GridValidRowModel = GridValidRowModel> = {
  rows: T[];
  columns: GridColDef<T>[];
  exportFileName: string;
  applyColumnFormatters?: GridExportFormatter<T>;
};

/**
 * 엑셀 파일 읽기 및 JSON 변환 관련 타입
 */
export type ExcelRowData = Record<string, unknown>;

export type ExcelRowTransformer = (rowData: ExcelRowData) => ExcelRowData | null;

export type ImportExcelToJsonParams = {
  file: File;
  columnFields: string[];
  startRow?: number; // 데이터 시작 행 번호 (1-based, 기본값: 4)
  worksheetIndex?: number; // 워크시트 인덱스 (1-based, 기본값: 1)
  transformRow?: ExcelRowTransformer; // 각 행 데이터 변환 함수 (선택)
  dateFields?: string[]; // 날짜 필드명 배열 (Date 객체로 변환되는 것을 방지하기 위해 텍스트로 읽음)
};

/**
 * 엑셀 파일을 읽어서 JSON 데이터 배열로 변환하는 공통 함수
 *
 * @param params - 엑셀 파일 읽기 파라미터
 * @returns 변환된 JSON 데이터 배열
 *
 * @example
 * ```typescript
 * const data = await importExcelToJson({
 *   file: excelFile,
 *   columnFields: ['service_cd', 'display_ctnt', 'qst_ctgr'],
 *   startRow: 4,
 *   transformRow: (rowData) => {
 *     // 커스텀 변환 로직
 *     if (rowData.age_grp) {
 *       rowData.age_grp = Number(rowData.age_grp);
 *     }
 *     return rowData;
 *   }
 * });
 * ```
 */
export const importExcelToJson = async ({
  file,
  columnFields,
  startRow = 4,
  worksheetIndex = 1,
  transformRow,
  dateFields = [],
}: ImportExcelToJsonParams): Promise<ExcelRowData[]> => {
  // ExcelJS 동적 import
  const ExcelJS = await import('exceljs');

  // 워크북 로드
  const workbook = new ExcelJS.Workbook();
  // 날짜를 텍스트로 읽기 위한 옵션 설정
  await workbook.xlsx.load(await file.arrayBuffer(), {
    ignoreNodes: [], // 모든 노드 읽기
  });

  // 워크시트 가져오기
  const worksheet = workbook.getWorksheet(worksheetIndex);

  if (!worksheet) {
    throw new Error(`워크시트를 찾을 수 없습니다. (인덱스: ${worksheetIndex})`);
  }

  const data: ExcelRowData[] = [];
  const lastRow = worksheet.lastRow?.number || startRow - 1;

  // 각 행의 데이터를 변환
  for (let rowNum = startRow; rowNum <= lastRow; rowNum++) {
    const row = worksheet.getRow(rowNum);
    const rowData: ExcelRowData = {};

    // 디버깅: 행의 모든 셀 정보 확인 (날짜 필드가 있는 행만)
    if (dateFields.length > 0 && rowNum <= startRow + 5) {
      console.log(`[${rowNum}행] 전체 셀 정보:`, {
        rowNumber: rowNum,
        columnFields,
        dateFields,
        allCells: Array.from({ length: 20 }, (_, i) => {
          const c = row.getCell(i + 1);
          return {
            colIndex: i + 1,
            text: c.text,
            value: c.value,
            type: c.type,
            numFmt: c.numFmt,
            model: (c as any).model,
          };
        }),
      });
    }

    // 컬럼 필드 순서대로 데이터 읽기
    columnFields.forEach((field, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      const isDateField = dateFields.includes(field);
      let cellValue: unknown;

      // 날짜 필드인 경우 상세 디버깅
      if (isDateField) {
        console.log(`[${rowNum}행 ${colIndex + 1}열] 날짜 필드 ${field} 처리 시작`, {
          columnFields,
          fieldIndex: colIndex,
          columnFieldAtThisIndex: columnFields[colIndex],
          allColumnFields: columnFields,
        });
      }

      // 날짜 필드인 경우: 14자리 숫자 형식 (20251125000000)만 허용
      if (isDateField) {
        // cell.text를 우선 확인 (텍스트로 입력된 경우)
        const cellText = String(cell.value ?? cell.text ?? '').trim();

        // 14자리 숫자 형식 검증 (YYYYMMDDHHmmss)
        if (/^\d{14}$/.test(cellText)) {
          // 14자리 숫자 형식 파싱: YYYYMMDDHHmmss
          const year = cellText.substring(0, 4);
          const month = cellText.substring(4, 6);
          const day = cellText.substring(6, 8);
          const hour = cellText.substring(8, 10);
          const minute = cellText.substring(10, 12);
          const second = cellText.substring(12, 14);

          // 날짜 유효성 검증 (간단한 범위 체크)
          const yearNum = parseInt(year);
          const monthNum = parseInt(month);
          const dayNum = parseInt(day);
          const hourNum = parseInt(hour);
          const minuteNum = parseInt(minute);
          const secondNum = parseInt(second);

          if (
            yearNum < 1900 ||
            yearNum > 9999 ||
            monthNum < 1 ||
            monthNum > 12 ||
            dayNum < 1 ||
            dayNum > 31 ||
            hourNum > 23 ||
            minuteNum > 59 ||
            secondNum > 59
          ) {
            throw new Error(
              `날짜 필드 ${field}의 값이 올바르지 않습니다 (${cellText}). ` +
                `연월일시분초 형식(14자리 숫자)으로 입력해주세요. 예: 20251125000000`,
            );
          }

          // YYYY-MM-DD HH:mm:ss 형식으로 변환
          cellValue = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
          console.log(`[날짜 필드 ${field}] 14자리 숫자 형식 파싱 성공:`, {
            input: cellText,
            output: cellValue,
          });
        } else if (cellText) {
          // 14자리 숫자 형식이 아닌 경우 에러
          throw new Error(
            `날짜 필드 ${field}는 14자리 숫자 형식(YYYYMMDDHHmmss)으로 입력해야 합니다. ` +
              `입력된 값: ${cellText}, 예시: 20251125000000`,
          );
        } else {
          // 빈 값인 경우
          cellValue = '';
        }
      } else {
        // 일반 필드: cell.value를 먼저 확인
        cellValue = cell.value;

        // ExcelJS의 rich text 객체 처리
        if (cellValue && typeof cellValue === 'object' && 'richText' in cellValue) {
          const richTextObj = cellValue as { richText: Array<{ text: string }> };
          cellValue = richTextObj.richText.map((t) => t.text).join('');
        }
        // 일반 필드가 Date 객체인 경우도 처리 (날짜 형식으로 보이는 경우)
        else if (cellValue instanceof Date) {
          // cell.text를 우선 확인
          if (cell.text && cell.text.trim()) {
            cellValue = cell.text.trim();
          } else {
            cellValue = cellValue.toISOString().replace('T', ' ').substring(0, 19);
          }
        }
      }

      rowData[field] = cellValue;
    });

    // 빈 행 스킵 (모든 필드가 비어있으면)
    const hasData = columnFields.some((field) => {
      const value = rowData[field];
      return value !== null && value !== undefined && String(value).trim() !== '';
    });

    if (!hasData) continue;

    // 커스텀 변환 함수 적용
    const transformedData = transformRow ? transformRow(rowData) : rowData;

    // transformRow가 null을 반환하면 해당 행 스킵
    if (transformedData === null) continue;

    data.push(transformedData);
  }

  return data;
};

/**
 * 주어진 rows/columns를 기반으로 엑셀 파일을 생성하여 다운로드한다.
 * - columns 순서 및 headerName을 그대로 사용
 * - valueFormatter/valueGetter가 있으면 포맷팅된 값을 사용
 */
export const exportGridToExcel = async <T extends GridValidRowModel = GridValidRowModel>({
  rows,
  columns,
  exportFileName,
  applyColumnFormatters,
}: ExportGridToExcelParams<T>): Promise<void> => {
  if (!rows.length) return;

  // 포맷터 적용된 컬럼 생성
  const processedColumnsForExport = applyColumnFormatters
    ? columns.map(applyColumnFormatters)
    : columns;

  // columns의 field와 headerName 매핑 생성
  const columnMap = new Map<string, string>();
  processedColumnsForExport.forEach((col) => {
    columnMap.set(col.field, col.headerName || col.field);
  });

  // 헤더 생성 (columns 순서대로, headerName 사용)
  const orderedFields = processedColumnsForExport.map((col) => col.field);
  const headers = orderedFields.map((field) => columnMap.get(field) || field);

  // ExcelJS 워크북 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // 헤더 행 추가
  const headerRow = worksheet.addRow(headers);

  // 헤더 스타일 적용
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }, // 파란색
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' }, // 흰색
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
  });

  // 데이터 행 추가 (화면에 표시되는 포맷팅된 값 사용)
  rows.forEach((row) => {
    const rowData = orderedFields.map((field) => {
      const column = processedColumnsForExport.find((col) => col.field === field);
      if (!column) return '';

      const rowObj = row as Record<string, unknown>;
      const rawValue = rowObj[field];

      // valueFormatter가 있으면 사용 (날짜, 셀렉트 필드 포맷팅)
      if (column.valueFormatter && typeof column.valueFormatter === 'function') {
        try {
          return column.valueFormatter({ value: rawValue } as never) ?? '';
        } catch {
          return rawValue ?? '';
        }
      }

      // valueGetter가 있으면 사용
      if (column.valueGetter && typeof column.valueGetter === 'function') {
        try {
          return column.valueGetter({ row, field } as never) ?? '';
        } catch {
          return rawValue ?? '';
        }
      }

      // 기본값
      return rawValue ?? '';
    });
    worksheet.addRow(rowData);
  });

  // 열 너비 자동 조정
  worksheet.columns = orderedFields.map((field, idx) => {
    // 헤더 길이
    const headerLength = (headers[idx] || '').length;
    // 데이터 최대 길이
    const maxDataLength = Math.max(
      ...rows.map((row) => {
        const rowObj = row as Record<string, unknown>;
        const value = rowObj[field];
        return String(value ?? '').length;
      }),
      0,
    );
    // 헤더와 데이터 중 더 긴 것 기준으로 너비 설정 (최소 10, 최대 50)
    const width = Math.min(Math.max(headerLength, maxDataLength, 10), 50);
    return { width };
  });

  // 파일명: {메뉴명}_{YYYYMMDD_HHmmss}.xlsx
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHmmss
  const fileName = `${exportFileName}_${dateStr}_${timeStr}.xlsx`;

  // 파일 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
