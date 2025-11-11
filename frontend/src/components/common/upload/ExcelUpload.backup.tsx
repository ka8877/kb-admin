// frontend/src/components/common/upload/ExcelUpload.tsx
import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import CreateDataActions from '../actions/CreateDataActions';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import ExcelJS from 'exceljs';

export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export type ValidationFunction = (
  value: string | number | Date | null | undefined,
  row: Record<string, unknown>,
) => ValidationResult;

export type ExcelUploadProps = {
  onSave: (file: File) => void;
  onCancel: () => void;
  columns?: GridColDef[]; // 템플릿 생성을 위한 컬럼 정의
  templateFileName?: string; // 템플릿 파일명
  exampleData?: Record<string, unknown>[]; // 예시 데이터 (선택적)
  fieldGuides?: Record<string, string>; // 각 필드별 작성 가이드
  validationRules?: Record<string, ValidationFunction>; // 필드별 validation 함수
  referenceData?: Record<string, Array<{ label: string; value: string }>>; // Sheet2에 표시할 참조 테이블
  acceptedFormats?: string[];
  title?: string;
  description?: string;
  templateLabel?: string;
  onTemplateDownload?: () => void; // 커스텀 템플릿 다운로드 핸들러
  saveLabel?: string;
  cancelLabel?: string;
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
};

const ExcelUpload: React.FC<ExcelUploadProps> = ({
  onSave,
  onCancel,
  columns,
  templateFileName = '업로드_템플릿',
  exampleData,
  fieldGuides,
  validationRules,
  referenceData,
  acceptedFormats = ['.xlsx', '.csv'],
  title = '엑셀 파일로 일괄 등록',
  description = '엑셀을 업로드하여 다수의 데이터를 한번에 신규등록 할 수 있습니다. (수정/삭제는 불가)',
  templateLabel = '엑셀 양식 다운로드',
  onTemplateDownload,
  saveLabel = '저장',
  cancelLabel = '취소',
  size = 'medium',
  isLoading = false,
}) => {
  const { showConfirm } = useConfirmDialog();
  const { showAlert } = useAlertDialog();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isValidFileFormat = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return acceptedFormats.some((format) => fileName.endsWith(format.toLowerCase()));
  };

  // 엑셀/CSV 파일 읽기 및 validation 함수
  const validateExcelFile = async (file: File): Promise<boolean> => {
    if (!validationRules || !columns) return true;

    try {
      const workbook = new ExcelJS.Workbook();
      const fileName = file.name.toLowerCase();

      // 파일 확장자에 따라 다른 방식으로 로드
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
          // CSV 파싱 (간단한 버전 - 따옴표 내 쉼표 처리)
          const row: (string | number)[] = [];
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

          worksheet.addRow(row);
        });
      } else {
        await workbook.xlsx.load(await file.arrayBuffer());
      }

      const worksheet = workbook.getWorksheet(1); // 첫 번째 시트

      if (!worksheet) {
        showAlert({
          title: 'Validation 오류',
          message: '워크시트를 찾을 수 없습니다.',
          severity: 'error',
        });
        return false;
      }

      // 4행부터 데이터 시작
      const startRow = 4;
      const columnFields = columns.map((col) => col.field);

      // 데이터가 있는 행 수 확인
      const lastRow = worksheet.lastRow?.number || startRow - 1;

      if (lastRow < startRow) {
        showAlert({
          title: 'Validation 오류',
          message: '데이터가 없습니다. 4행부터 데이터를 입력해주세요.',
          severity: 'error',
        });
        return false;
      }

      // 실제 데이터가 있는 행 개수 추적
      let dataRowCount = 0;

      // 각 행별 validation 체크
      for (let rowNum = startRow; rowNum <= lastRow; rowNum++) {
        const row = worksheet.getRow(rowNum);
        const rowData: Record<string, unknown> = {};

        // 행의 각 열 데이터를 객체로 변환
        columnFields.forEach((field, colIndex) => {
          const cellValue = row.getCell(colIndex + 1).value;
          rowData[field] = cellValue;
        });

        // 모든 필드가 비어있으면 빈 행으로 간주하고 스킵
        const hasData = columnFields.some((field) => {
          const value = rowData[field];
          return value !== null && value !== undefined && String(value).trim() !== '';
        });

        if (!hasData) {
          continue; // 빈 행은 validation 하지 않음
        }

        // 데이터가 있는 행 발견
        dataRowCount++;

        // 각 필드별 validation 실행
        for (const [fieldName, validationFn] of Object.entries(validationRules)) {
          const fieldIndex = columnFields.indexOf(fieldName);
          if (fieldIndex === -1) continue;

          const cellValue = rowData[fieldName];
          const validationValue =
            cellValue instanceof Date
              ? cellValue
              : typeof cellValue === 'string' || typeof cellValue === 'number'
                ? cellValue
                : cellValue == null
                  ? null
                  : undefined;
          const validationResult = validationFn(validationValue, rowData);

          if (!validationResult.isValid) {
            showAlert({
              title: 'Validation 오류',
              message: `${rowNum}행: ${validationResult.errorMessage}`,
              severity: 'error',
            });
            return false;
          }
        }
      }

      // 모든 행을 체크했는데 데이터가 하나도 없으면 에러
      if (dataRowCount === 0) {
        showAlert({
          title: 'Validation 오류',
          message: '데이터가 없습니다. 4행부터 데이터를 입력해주세요.',
          severity: 'error',
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('파일 validation 오류:', error);
      showAlert({
        title: 'Validation 오류',
        message: '파일을 읽는 중 오류가 발생했습니다.',
        severity: 'error',
      });
      return false;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!isValidFileFormat(file)) {
        const formatList = acceptedFormats.map((f) => f.replace('.', '')).join(', ');
        showAlert({
          title: '파일 포맷 오류',
          message: `파일 포맷을 확인해주세요\n(가능포맷: ${formatList})`,
          severity: 'error',
        });
        // input 초기화
        event.target.value = '';
        return;
      }

      // validation 수행
      const isValid = await validateExcelFile(file);
      if (!isValid) {
        // validation 실패 시 파일 선택 취소
        event.target.value = '';
        return;
      }

      setSelectedFile(file);
      // validation 통과 시 알림
      showAlert({
        title: '파일 검증 완료',
        message: '등록이 완료되었습니다',
        severity: 'success',
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (!isValidFileFormat(file)) {
        const formatList = acceptedFormats.map((f) => f.replace('.', '')).join(', ');
        showAlert({
          title: '파일 포맷 오류',
          message: `파일 포맷을 확인해주세요\n(가능포맷: ${formatList})`,
          severity: 'error',
        });
        return;
      }

      // validation 수행
      const isValid = await validateExcelFile(file);
      if (!isValid) {
        // validation 실패 시 파일 선택 취소
        return;
      }

      setSelectedFile(file);
      // validation 통과 시 알림
      showAlert({
        title: '파일 검증 완료',
        message: '등록이 완료되었습니다',
        severity: 'success',
      });
    }
  };

  const handleSave = () => {
    if (!selectedFile) {
      showAlert({
        title: '파일 선택 필요',
        message: '파일을 선택해주세요.',
        severity: 'warning',
      });
      return;
    }

    showConfirm({
      title: '저장 확인',
      message: '저장하시겠습니까?',
      onConfirm: () => {
        try {
          onSave(selectedFile);
          // 성공 알림
          showAlert({
            title: '등록 완료',
            message: '등록을 성공하였습니다',
            severity: 'success',
          });
        } catch (error) {
          // 오류 알림
          showAlert({
            title: '등록 실패',
            message: '등록 중 오류가 발생했습니다. 다시 시도해주세요.',
            severity: 'error',
          });
        }
      },
    });
  };

  const handleTemplateDownloadCSV = () => {
    // columns가 없으면 템플릿 생성 불가
    if (!columns || columns.length === 0) {
      showAlert({
        title: '템플릿 생성 불가',
        message: '템플릿 양식을 생성할 수 없습니다.',
        severity: 'error',
      });
      return;
    }

    try {
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
          // CSV에서는 쉼표와 따옴표를 이스케이프
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
          const rowData = fields
            .map((field) => {
              const value = example[field] ?? '';
              // 쉼표, 따옴표, 줄바꿈이 있으면 따옴표로 감싸기
              if (
                String(value).includes(',') ||
                String(value).includes('"') ||
                String(value).includes('\n')
              ) {
                return `"${String(value).replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(',');
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

      // 파일 다운로드
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateFileName}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV 템플릿 다운로드 실패:', error);
      showAlert({
        title: '다운로드 실패',
        message: 'CSV 템플릿 다운로드 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const handleTemplateDownload = async () => {
    // 커스텀 핸들러가 있으면 사용
    if (onTemplateDownload) {
      onTemplateDownload();
      return;
    }

    // columns가 없으면 템플릿 생성 불가
    if (!columns || columns.length === 0) {
      showAlert({
        title: '템플릿 생성 불가',
        message: '템플릿 양식을 생성할 수 없습니다.',
        severity: 'error',
      });
      return;
    }

    try {
      // ExcelJS 워크북 생성
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
        // fieldGuides가 있으면 사용, 없으면 기본값
        if (fieldGuides && fieldGuides[field]) {
          return fieldGuides[field];
        }
        // 기본 가이드 메시지
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
      const dataStartRow = worksheet.rowCount + 1; // 데이터 시작 행 번호
      const maxDataRows = 20; // 드롭다운 적용 범위를 제한
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
        refSheet.mergeCells(currentRow, 1, currentRow, 2); // A1:B1 병합
        currentRow++;

        // 두 번째 안내 메시지
        const noticeCell2 = refSheet.getCell(currentRow, 1);
        noticeCell2.value = '아래의 표에 나와있는 데이터들은 나와있는 value 값을 입력해주세요';
        noticeCell2.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' }, // 빨간색
        };
        noticeCell2.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' }, // 흰색
          size: 12,
        };
        noticeCell2.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
        refSheet.mergeCells(currentRow, 1, currentRow, 2); // A2:B2 병합
        refSheet.getRow(currentRow).height = 40; // 높이 조정
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
            color: { argb: 'FFFFFFFF' }, // 흰색
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
                fgColor: { argb: 'FFCCCCCC' }, // 회색
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

      // 열 너비 자동 조정 (헤더, 가이드, 예시 데이터 모두 고려)
      worksheet.columns = columns.map((col, idx) => {
        const field = col.field;
        const headerLength = (col.headerName || col.field).length;

        // 가이드 행 길이
        const guideLength = fieldGuides && fieldGuides[field] ? fieldGuides[field].length : 10;

        // 예시 데이터 길이
        let exampleLength = 0;
        if (exampleData && exampleData.length > 0) {
          exampleLength = Math.max(
            ...exampleData.map((example) => {
              const value = example[field];
              return String(value ?? '').length;
            }),
          );
        }

        // 헤더, 가이드, 예시 중 가장 긴 것 기준 (최소 15, 최대 50)
        const maxLength = Math.max(headerLength, guideLength, exampleLength);
        const width = Math.min(Math.max(maxLength * 1.2, 15), 50);
        return { width };
      });

      // 파일 다운로드
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateFileName}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('템플릿 다운로드 실패:', error);
      showAlert({
        title: '다운로드 실패',
        message: '템플릿 다운로드 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const acceptString = acceptedFormats.join(',');
  const formatDisplayText = `지원하는 파일 양식: ${acceptedFormats.map((f) => f.replace('.', '')).join(', ')}`;

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
              {description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              정해진 엑셀 양식에 입력하여 업로드하세요 ({formatDisplayText})
            </Typography>
          </Box>

          {(onTemplateDownload || columns) && (
            <Box sx={{ textAlign: 'center' }}>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 1 }}>
                {/* <Button variant="text" size="small" onClick={handleTemplateDownload}>
                  📁 {templateLabel} (Excel)
                </Button> */}
                <Button variant="text" size="small" onClick={handleTemplateDownloadCSV}>
                  📁 {templateLabel}
                </Button>
              </Stack>
              <Typography variant="caption" display="block" color="text.secondary">
                템플릿에 맞춰 데이터를 입력한 후 업로드해주세요
              </Typography>
            </Box>
          )}

          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed',
              borderColor: isDragOver ? 'primary.main' : selectedFile ? 'success.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              width: '100%',
              bgcolor: isDragOver ? 'primary.50' : selectedFile ? 'success.50' : 'grey.50',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                borderColor: selectedFile ? 'success.main' : 'primary.main',
                bgcolor: selectedFile ? 'success.100' : 'primary.100',
              },
            }}
          >
            <Typography variant="body1" sx={{ mb: 2 }}>
              {isDragOver
                ? '파일을 여기에 놓아주세요'
                : selectedFile
                  ? `선택된 파일: ${selectedFile.name}`
                  : '클릭 또는 드래그해서 파일을 선택해주세요'}
            </Typography>
            <Button variant="outlined" component="label">
              파일 선택
              <input type="file" accept={acceptString} hidden onChange={handleFileChange} />
            </Button>
          </Box>

          <CreateDataActions
            onSave={handleSave}
            onCancel={onCancel}
            saveLabel={saveLabel}
            cancelLabel={cancelLabel}
            size={size}
            isLoading={isLoading}
            disabled={!selectedFile}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ExcelUpload;
