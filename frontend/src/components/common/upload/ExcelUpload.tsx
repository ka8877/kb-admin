// frontend/src/components/common/upload/ExcelUpload.tsx
import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import CreateDataActions from '../actions/CreateDataActions';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useAlertDialog } from '../../../hooks/useAlertDialog';
import ExcelJS from 'exceljs';

export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export type ValidationFunction = (value: any, row: any) => ValidationResult;

export type ExcelUploadProps = {
  onSave: (file: File) => void;
  onCancel: () => void;
  columns?: GridColDef[]; // 템플릿 생성을 위한 컬럼 정의
  templateFileName?: string; // 템플릿 파일명
  exampleData?: any[]; // 예시 데이터 (선택적)
  fieldGuides?: Record<string, string>; // 각 필드별 작성 가이드
  validationRules?: Record<string, ValidationFunction>; // 필드별 validation 함수
  dropdownOptions?: Record<string, Array<{ label: string; value: string }>>; // 드롭다운 옵션
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
  dropdownOptions,
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

  // 엑셀 파일 읽기 및 validation 함수
  const validateExcelFile = async (file: File): Promise<boolean> => {
    if (!validationRules || !columns) return true;

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
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

      // 각 행별 validation 체크
      for (let rowNum = startRow; rowNum <= lastRow; rowNum++) {
        const row = worksheet.getRow(rowNum);
        const rowData: any = {};

        // 행의 각 열 데이터를 객체로 변환
        columnFields.forEach((field, colIndex) => {
          let cellValue = row.getCell(colIndex + 1).value;

          // 드롭다운 필드인 경우 label을 value로 변환
          if (dropdownOptions && dropdownOptions[field] && cellValue) {
            const option = dropdownOptions[field].find((opt) => opt.label === String(cellValue));
            if (option) {
              cellValue = option.value;
            }
          }

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

        // 각 필드별 validation 실행
        for (const [fieldName, validationFn] of Object.entries(validationRules)) {
          const fieldIndex = columnFields.indexOf(fieldName);
          if (fieldIndex === -1) continue;

          const cellValue = rowData[fieldName];
          const validationResult = validationFn(cellValue, rowData);

          if (!validationResult.isValid) {
            const colLetter = String.fromCharCode(65 + fieldIndex); // A, B, C...
            showAlert({
              title: 'Validation 오류',
              message: `${rowNum} - ${colLetter} ${validationResult.errorMessage}`,
              severity: 'error',
            });
            return false;
          }
        }
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
      // validation 통과 시 성공 알림
      showAlert({
        title: '파일 검증 완료',
        message: '등록을 성공하였습니다',
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
      // validation 통과 시 성공 알림
      showAlert({
        title: '파일 검증 완료',
        message: '등록을 성공하였습니다',
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

      // 1행 마지막 열(I열)에 안내 메시지 추가
      const lastColIndex = headers.length + 1; // I열 (9번째 열)
      const noticeCell = worksheet.getCell(1, lastColIndex);
      noticeCell.value = '4행부터 실제 데이터를 입력해주세요';
      noticeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' }, // 빨간색
      };
      noticeCell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }, // 흰색
      };
      noticeCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };

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

      // 5. 드롭다운 리스트 설정 (있는 경우)
      if (dropdownOptions) {
        fields.forEach((field, colIndex) => {
          if (dropdownOptions[field]) {
            const options = dropdownOptions[field];

            // 옵션 수 제한 (Excel 제한 고려)
            if (options.length > 50) {
              console.warn(
                `${field} 필드의 옵션이 너무 많습니다 (${options.length}개). 드롭다운을 생략합니다.`,
              );
              return;
            }

            const labels = options.map((opt) => opt.label);

            // 특수 문자 처리: 쌍따옴표 이스케이프
            const safeLabels = labels.map((label) => label.replace(/"/g, '""'));

            // 드롭다운 범위 제한
            const colLetter = String.fromCharCode(65 + colIndex); // A, B, C, ...
            const endRow = dataStartRow + maxDataRows - 1;
            const dataRange = `${colLetter}${dataStartRow}:${colLetter}${endRow}`;

            try {
              // 각 셀에 개별적으로 데이터 validation 설정
              for (let rowNum = dataStartRow; rowNum <= dataStartRow + maxDataRows - 1; rowNum++) {
                const cell = worksheet.getCell(rowNum, colIndex + 1);
                cell.dataValidation = {
                  type: 'list',
                  allowBlank: true,
                  formulae: [`"${safeLabels.join(',')}"`],
                  showErrorMessage: true,
                  errorStyle: 'error',
                  errorTitle: '입력 오류',
                  error: `다음 중에서 선택해주세요: ${labels.slice(0, 3).join(', ')}${labels.length > 3 ? '...' : ''}`,
                  showInputMessage: true,
                  promptTitle: field,
                  prompt: `드롭다운에서 선택하거나 직접 입력하세요`,
                };
              }
            } catch (error) {
              console.warn(`${field} 필드 드롭다운 설정 실패:`, error);
            }
          }
        });
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

      // 안내 메시지 열 너비 조정 (메시지가 잘 보이도록 충분히 넓게)
      worksheet.getColumn(lastColIndex).width = 45;

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
              <Button variant="text" size="small" sx={{ mb: 1 }} onClick={handleTemplateDownload}>
                📁 {templateLabel}
              </Button>
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
