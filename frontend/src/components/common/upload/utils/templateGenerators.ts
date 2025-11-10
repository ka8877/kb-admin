// frontend/src/components/common/upload/utils/templateGenerators.ts
import ExcelJS from 'exceljs';
import type { GridColDef } from '@mui/x-data-grid';
import { escapeCSVValue } from './excelUtils';

export type ReferenceData = Record<string, Array<{ label: string; value: string }>>;

/**
 * CSV 템플릿 생성
 */
export const generateCSVTemplate = (
  columns: GridColDef[],
  fieldGuides?: Record<string, string>,
  exampleData?: any[],
  referenceData?: ReferenceData,
): string => {
  const fields = columns.map((col) => col.field);
  const headers = columns.map((col) => col.headerName || col.field);

  // 참조 데이터를 P열에 추가하기 위한 준비
  const referenceLines: string[] = [];
  if (referenceData && Object.keys(referenceData).length > 0) {
    referenceLines.push('4행부터 실제 데이터를 입력해주세요');
    referenceLines.push('아래의 표에 나와있는 데이터들은 나와있는 value 값을 입력해주세요');
    referenceLines.push('');
    referenceLines.push('===== 참조 데이터 =====');
    referenceLines.push('');
    Object.entries(referenceData).forEach(([title, options]) => {
      referenceLines.push(`[${title}]`);
      referenceLines.push('이름 | value 값');
      options.forEach((opt) => {
        referenceLines.push(`${opt.label} | ${opt.value}`);
      });
      referenceLines.push('');
    });
  }

  // CSV 생성 (UTF-8 BOM 포함)
  let csvContent = '\uFEFF'; // UTF-8 BOM

  // 헤더 행 (P열에 참조 데이터 시작)
  let headerRow = headers.join(',');
  if (referenceLines.length > 0) {
    // P열까지 빈 컬럼 추가 (A부터 O까지 = 15개)
    const emptyColumns = Math.max(0, 15 - headers.length);
    headerRow += ',' + Array(emptyColumns).fill('').join(',') + ',"참조 데이터"';
  }
  csvContent += headerRow + '\n';

  // 가이드 행
  const guideRow = fields
    .map((field) => {
      const guide = fieldGuides?.[field] || '값을 입력하세요';
      return `"${guide.replace(/"/g, '""')}"`;
    })
    .join(',');
  let guideRowWithRef = guideRow;
  if (referenceLines.length > 0) {
    const emptyColumns = Math.max(0, 15 - headers.length);
    guideRowWithRef +=
      ',' + Array(emptyColumns).fill('').join(',') + ',"' + (referenceLines[0] || '') + '"';
  }
  csvContent += guideRowWithRef + '\n';

  // 예시 데이터 행 및 참조 데이터
  let maxRows = 0;
  const dataRows: string[] = [];

  if (exampleData && exampleData.length > 0) {
    exampleData.forEach((example) => {
      const rowData = fields.map((field) => escapeCSVValue(example[field])).join(',');
      dataRows.push(rowData);
    });
    maxRows = dataRows.length;
  }

  // 참조 데이터와 예시 데이터를 함께 출력
  const totalRows = Math.max(maxRows, referenceLines.length - 1);
  for (let i = 0; i < totalRows; i++) {
    let row = dataRows[i] || fields.map(() => '').join(',');
    if (referenceLines.length > 0 && i + 1 < referenceLines.length) {
      const emptyColumns = Math.max(0, 15 - headers.length);
      const refData = referenceLines[i + 1] || '';
      row +=
        ',' + Array(emptyColumns).fill('').join(',') + ',"' + refData.replace(/"/g, '""') + '"';
    }
    csvContent += row + '\n';
  }

  return csvContent;
};

/**
 * Excel 템플릿 생성
 */
export const generateExcelTemplate = async (
  columns: GridColDef[],
  fieldGuides?: Record<string, string>,
  exampleData?: any[],
  referenceData?: ReferenceData,
): Promise<ExcelJS.Workbook> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('템플릿');

  // 컬럼 정보 추출
  const fields = columns.map((col) => col.field);
  const headers = columns.map((col) => col.headerName || col.field);

  // 1. 헤더 행 추가
  const headerRow = worksheet.addRow(headers);
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

  // 2. 가이드 행 추가
  const guideRowData = fields.map((field) => {
    if (fieldGuides && fieldGuides[field]) {
      return fieldGuides[field];
    }
    return '값을 입력하세요';
  });
  const guideRow = worksheet.addRow(guideRowData);
  guideRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF4CC' }, // 연한 노란색
    };
    cell.font = {
      italic: true,
      color: { argb: 'FF666666' },
    };
    cell.alignment = {
      horizontal: 'left',
      vertical: 'middle',
    };
  });

  // 3. 예시 데이터 행 추가 (있는 경우)
  if (exampleData && exampleData.length > 0) {
    exampleData.forEach((example) => {
      const exampleRowData = fields.map((field) => example[field] ?? '');
      const exampleRow = worksheet.addRow(exampleRowData);
      exampleRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8E8E8' }, // 회색
        };
        cell.font = {
          color: { argb: 'FF666666' },
        };
      });
    });
  }

  // 4. 빈 행 추가 (실제 작성용)
  const maxDataRows = 20;
  for (let i = 0; i < maxDataRows; i++) {
    worksheet.addRow(fields.map(() => ''));
  }

  // 5. Sheet2에 참조 데이터 테이블 생성 (referenceData가 있는 경우)
  if (referenceData && Object.keys(referenceData).length > 0) {
    const refSheet = workbook.addWorksheet('양식 가이드');

    let currentRow = 1;

    // 상단 안내 메시지 추가
    const noticeCell = refSheet.getCell(currentRow, 1);
    noticeCell.value = '4행부터 실제 데이터를 입력해주세요';
    noticeCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF0000' }, // 빨간색
    };
    noticeCell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' }, // 흰색
      size: 12,
    };
    noticeCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    refSheet.mergeCells(currentRow, 1, currentRow, 2);
    currentRow++;

    // 두 번째 안내 메시지
    const noticeCell2 = refSheet.getCell(currentRow, 1);
    noticeCell2.value = '아래의 표에 나와있는 데이터들은 나와있는 value 값을 입력해주세요';
    noticeCell2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF0000' },
    };
    noticeCell2.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 12,
    };
    noticeCell2.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    refSheet.mergeCells(currentRow, 1, currentRow, 2);
    refSheet.getRow(currentRow).height = 40;
    currentRow++;

    // 빈 행 추가
    currentRow++;

    Object.entries(referenceData).forEach(([title, options]) => {
      // 테이블 제목 추가
      const titleCell = refSheet.getCell(currentRow, 1);
      titleCell.value = title;
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF9900' }, // 주황색
      };
      titleCell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 14,
      };
      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      currentRow++;

      // 헤더 추가 (이름, value 값)
      const headerRow = refSheet.getRow(currentRow);
      headerRow.getCell(1).value = '이름';
      headerRow.getCell(2).value = 'value 값';
      headerRow.eachCell((cell, colNum) => {
        if (colNum <= 2) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCCCCC' },
          };
          cell.font = {
            bold: true,
          };
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
          };
        }
      });
      currentRow++;

      // 데이터 추가
      options.forEach((opt) => {
        const dataRow = refSheet.getRow(currentRow);
        dataRow.getCell(1).value = opt.label;
        dataRow.getCell(2).value = opt.value;
        currentRow++;
      });

      // 빈 행 추가 (다음 테이블과의 간격)
      currentRow += 2;
    });

    // 열 너비 조정
    refSheet.getColumn(1).width = 25;
    refSheet.getColumn(2).width = 30;
  }

  // 열 너비 자동 조정
  worksheet.columns = columns.map((col) => {
    const field = col.field;
    const headerLength = (col.headerName || col.field).length;
    const guideLength = fieldGuides && fieldGuides[field] ? fieldGuides[field].length : 10;

    let exampleLength = 0;
    if (exampleData && exampleData.length > 0) {
      exampleLength = Math.max(
        ...exampleData.map((example) => {
          const value = example[field];
          return String(value ?? '').length;
        }),
      );
    }

    const maxLength = Math.max(headerLength, guideLength, exampleLength);
    const width = Math.min(Math.max(maxLength * 1.2, 15), 50);
    return { width };
  });

  return workbook;
};

/**
 * Workbook을 다운로드
 */
export const downloadWorkbook = async (
  workbook: ExcelJS.Workbook,
  fileName: string,
  format: 'xlsx' | 'csv',
): Promise<void> => {
  if (format === 'csv') {
    const csvContent = workbook.csv.writeBuffer ? await workbook.csv.writeBuffer() : '';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

/**
 * CSV 파일 다운로드
 */
export const downloadCSV = (content: string, fileName: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
