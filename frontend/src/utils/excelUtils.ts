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


