// frontend/src/components/common/upload/ExcelUpload.tsx
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Box, Button, Card, CardContent, Typography, Stack } from '@mui/material';
import CreateDataActions from '../actions/CreateDataActions';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { loadWorkbookFromFile } from './utils/excelUtils';
import { validateWorksheetData } from './utils/validationUtils';
import {
  generateCSVTemplate,
  generateExcelTemplate,
  downloadCSV,
  downloadWorkbook,
} from './utils/templateGenerators';
import {
  ALERT_MESSAGES,
  CONFIRM_TITLES,
  CONFIRM_MESSAGES,
  getFileFormatErrorMessage,
  GUIDE_MESSAGES,
} from '@/constants/message';
import type { ExcelUploadProps } from './type';
export type { ValidationFunction, ReferenceData } from './type';
import ExcelPreviewList, {
  type ExcelPreviewListRef,
} from '@/components/common/list/ExcelPreviewList';
import { parseRowData, hasRowData } from './utils/excelUtils';
import type { GridValidRowModel } from '@mui/x-data-grid';

const ExcelUpload = <T extends GridValidRowModel = GridValidRowModel>({
  onSave,
  onCancel,
  columns,
  gridColumns,
  templateFileName = '업로드_템플릿',
  exampleData,
  fieldGuides,
  validationRules,
  referenceData,
  acceptedFormats = ['.xlsx', '.csv'],
  title = '엑셀 파일로 일괄 등록',
  description = GUIDE_MESSAGES.EXCEL_UPLOAD_DESCRIPTION,
  templateLabel = '엑셀 양식 다운로드',
  onTemplateDownload,
  saveLabel = '저장',
  cancelLabel = '취소',
  size = 'medium',
  isLoading = false,
  selectFields,
  dateFields,
  dateFormat = 'YYYYMMDDHHmmss',
  validator,
  getDynamicSelectOptions,
  onProcessRowUpdate,
  rowSanitizer,
  getRequiredFields,
  readOnlyFields = ['no'],
  rowIdGetter,
  dynamicSelectFields,
  preSaveCheck,
}: ExcelUploadProps<T>): JSX.Element => {
  // 그리드 표시용 컬럼 (gridColumns가 있으면 사용, 없으면 columns 사용)
  const displayColumns = gridColumns || columns;
  const { showConfirm } = useConfirmDialog();
  const { showAlert } = useAlertDialog();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [uploadKey, setUploadKey] = useState(0); // 파일 업로드 시마다 증가
  const excelPreviewListRef = useRef<ExcelPreviewListRef>(null);

  // 새 행 추가 핸들러
  const handleAddRow = useCallback(() => {
    if (!displayColumns) return;

    // 새 행의 no 값 계산
    const maxNo = parsedData.reduce((max, row) => {
      const no = typeof row.no === 'number' ? row.no : 0;
      return Math.max(max, no);
    }, 0);

    // 빈 행 생성 (no만 설정, 나머지는 빈 값)
    const newRow: Record<string, unknown> = { no: maxNo + 1 };
    displayColumns.forEach((col) => {
      if (col.field !== 'no') {
        newRow[col.field] = '';
      }
    });

    setParsedData([...parsedData, newRow]);
  }, [parsedData, displayColumns]);

  const isValidFileFormat = useCallback(
    (file: File): boolean => {
      const fileName = file.name.toLowerCase();
      return acceptedFormats.some((format) => fileName.endsWith(format.toLowerCase()));
    },
    [acceptedFormats],
  );

  const parseExcelToJSON = useCallback(
    async (file: File): Promise<Record<string, unknown>[]> => {
      if (!columns) return [];

      const workbook = await loadWorkbookFromFile(file);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) return [];

      const columnFields = columns.map((col) => col.field);
      const startRow = 4;
      const lastRow = worksheet.lastRow?.number || startRow - 1;
      const data: Record<string, unknown>[] = [];

      let no = 1;
      for (let rowNum = startRow; rowNum <= lastRow; rowNum++) {
        const row = worksheet.getRow(rowNum);
        const rowData = parseRowData(row, columnFields);

        if (!hasRowData(rowData, columnFields)) {
          continue;
        }

        // 날짜 필드를 문자열로 변환
        if (dateFields) {
          dateFields.forEach((field) => {
            if (rowData[field] !== null && rowData[field] !== undefined) {
              // 숫자나 Date 객체를 문자열로 변환
              rowData[field] = String(rowData[field]);
            }
          });
        }

        // no 필드 추가
        data.push({ no, ...rowData });
        no++;
      }

      return data;
    },
    [columns, dateFields],
  );

  const validateFile = useCallback(
    async (file: File): Promise<boolean> => {
      if (!columns) return true;

      try {
        const workbook = await loadWorkbookFromFile(file);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
          showAlert({
            title: ALERT_MESSAGES.VALIDATION_ERROR,
            message: ALERT_MESSAGES.WORKSHEET_NOT_FOUND,
            severity: 'error',
          });
          return false;
        }

        // 4행부터 데이터가 하나라도 있는지 확인
        const columnFields = columns.map((col) => col.field);
        const startRow = 4;
        const lastRow = worksheet.lastRow?.number || startRow - 1;

        let hasData = false;
        for (let rowNum = startRow; rowNum <= lastRow; rowNum++) {
          const row = worksheet.getRow(rowNum);
          const rowData = parseRowData(row, columnFields);
          if (hasRowData(rowData, columnFields)) {
            hasData = true;
            break;
          }
        }

        if (!hasData) {
          showAlert({
            title: ALERT_MESSAGES.VALIDATION_ERROR,
            message: '데이터가 없습니다. 4행부터 데이터를 입력해주세요.',
            severity: 'error',
          });
          return false;
        }

        return true;
      } catch (error) {
        console.error('파일 validation 오류:', error);
        showAlert({
          title: ALERT_MESSAGES.VALIDATION_ERROR,
          message: ALERT_MESSAGES.FILE_READ_ERROR,
          severity: 'error',
        });
        return false;
      }
    },
    [columns, showAlert],
  );

  const processFile = useCallback(
    async (file: File, clearInput?: () => void): Promise<void> => {
      if (!isValidFileFormat(file)) {
        showAlert({
          title: ALERT_MESSAGES.FILE_FORMAT_ERROR,
          message: getFileFormatErrorMessage(acceptedFormats),
          severity: 'error',
        });
        clearInput?.();
        return;
      }

      const isValid = await validateFile(file);
      if (!isValid) {
        clearInput?.();
        return;
      }

      // validation 통과 후 데이터 파싱
      const jsonData = await parseExcelToJSON(file);

      console.log('📄 파싱된 엑셀 데이터:', jsonData);
      console.log('📄 첫 번째 행:', jsonData[0]);

      // 기존 데이터 초기화하고 새 데이터로 덮어쓰기 (새 배열 참조 생성)
      setParsedData([...jsonData]);
      setSelectedFile(file);
      setUploadKey((prev) => prev + 1); // 키를 증가시켜 강제 리렌더링

      showAlert({
        title: ALERT_MESSAGES.FILE_VALIDATION_COMPLETE,
        message: ALERT_MESSAGES.FILE_UPLOAD_SUCCESS,
        severity: 'success',
      });
    },
    [isValidFileFormat, validateFile, parseExcelToJSON, acceptedFormats, showAlert],
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await processFile(file, () => {
          event.target.value = '';
        });
      }
    },
    [processFile],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        await processFile(file);
      }
    },
    [processFile],
  );

  const handleDataChange = useCallback((updatedData: Record<string, unknown>[]) => {
    console.log('🔄 handleDataChange 호출됨 - 업데이트된 데이터:', updatedData);
    // no 필드를 오름차순으로 재설정
    const reindexedData = updatedData.map((row, index) => ({
      ...row,
      no: index + 1,
    }));
    setParsedData(reindexedData);
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedFile || parsedData.length === 0) {
      showAlert({
        title: ALERT_MESSAGES.FILE_SELECT_REQUIRED,
        message: ALERT_MESSAGES.PLEASE_SELECT_FILE,
        severity: 'warning',
      });
      return;
    }

    console.log('🔍 ExcelUpload handleSave - parsedData:', parsedData);

    // Validation 체크 (confirm 전에 먼저 실행)
    if (validator && parsedData.length > 0) {
      console.log('🔍 validation 시작');
      for (let rowIndex = 0; rowIndex < parsedData.length; rowIndex++) {
        const row = parsedData[rowIndex];
        const validationResults = validator(row as any);

        // 컴럼 순서대로 validation 체크
        if (displayColumns) {
          for (const col of displayColumns) {
            const fieldName = col.field;
            const result = validationResults[fieldName];

            if (result && !result.isValid) {
              // 첫 번째 에러 발견 시 즉시 alert 표시하고 return
              const rowNumber = rowIndex + 1;
              const errorMessage = `${rowNumber}행: ${result.message}`;
              console.log('🔍 validation 실패:', errorMessage);
              showAlert({
                title: '입력값 확인',
                message: errorMessage,
                severity: 'error',
                onConfirm: () => {
                  // alert 확인 후 해당 행과 셀로 포커스 이동
                  if (excelPreviewListRef.current) {
                    excelPreviewListRef.current.focusCell(rowIndex, fieldName);
                  }
                },
              });
              return;
            }
          }
        }
      }
      console.log('🔍 모든 validation 통과');
    }

    // preSaveCheck (중복 체크 등) 실행
    if (preSaveCheck) {
      const checkResult = preSaveCheck(parsedData as T[]);
      if (checkResult) {
        showAlert({
          title: '데이터 확인',
          message: checkResult,
          severity: 'warning',
        });
        return;
      }
    }

    // Validation 통과 후 confirm 표시
    showConfirm({
      title: CONFIRM_TITLES.SAVE,
      message: CONFIRM_MESSAGES.SAVE,
      onConfirm: () => {
        const executeSave = async () => {
          try {
            console.log('🔍 저장 확인 - onSave에 전달할 데이터:', parsedData);
            // ExcelListPreview에서 편집된 데이터를 전달
            await onSave(parsedData as any);
          } catch (error) {
            showAlert({
              title: ALERT_MESSAGES.UPLOAD_FAILED,
              message: ALERT_MESSAGES.UPLOAD_ERROR_RETRY,
              severity: 'error',
            });
          }
        };
        executeSave();
      },
    });
  }, [selectedFile, parsedData, showAlert, showConfirm, onSave, validator, displayColumns]);

  const handleTemplateDownloadCSV = useCallback(() => {
    if (!columns || columns.length === 0) {
      showAlert({
        title: ALERT_MESSAGES.TEMPLATE_GENERATION_ERROR,
        message: ALERT_MESSAGES.TEMPLATE_GENERATION_FAILED,
        severity: 'error',
      });
      return;
    }

    try {
      const csvContent = generateCSVTemplate(columns, fieldGuides, exampleData, referenceData);
      downloadCSV(csvContent, templateFileName);
    } catch (error) {
      console.error('CSV 템플릿 다운로드 실패:', error);
      showAlert({
        title: ALERT_MESSAGES.DOWNLOAD_FAILED,
        message: ALERT_MESSAGES.CSV_TEMPLATE_DOWNLOAD_ERROR,
        severity: 'error',
      });
    }
  }, [columns, fieldGuides, exampleData, referenceData, templateFileName, showAlert]);

  const handleTemplateDownload = useCallback(async () => {
    if (onTemplateDownload) {
      onTemplateDownload();
      return;
    }

    if (!columns || columns.length === 0) {
      showAlert({
        title: ALERT_MESSAGES.TEMPLATE_GENERATION_ERROR,
        message: ALERT_MESSAGES.TEMPLATE_GENERATION_FAILED,
        severity: 'error',
      });
      return;
    }

    try {
      const workbook = await generateExcelTemplate(
        columns,
        fieldGuides,
        exampleData,
        referenceData,
      );
      await downloadWorkbook(workbook, templateFileName, 'xlsx');
    } catch (error) {
      console.error('템플릿 다운로드 실패:', error);
      showAlert({
        title: ALERT_MESSAGES.DOWNLOAD_FAILED,
        message: ALERT_MESSAGES.TEMPLATE_DOWNLOAD_ERROR,
        severity: 'error',
      });
    }
  }, [
    onTemplateDownload,
    columns,
    fieldGuides,
    exampleData,
    referenceData,
    templateFileName,
    showAlert,
  ]);

  const acceptString = useMemo(() => acceptedFormats.join(','), [acceptedFormats]);
  const formatDisplayText = useMemo(
    () => `지원하는 파일 양식: ${acceptedFormats.map((f) => f.replace('.', '')).join(', ')}`,
    [acceptedFormats],
  );

  return (
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
              📁 {templateLabel} (CSV)
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
          <input
            type="file"
            accept={acceptString}
            hidden
            onChange={handleFileChange}
            onClick={(e) => {
              // 같은 파일을 다시 선택해도 onChange가 발생하도록 value 초기화
              (e.target as HTMLInputElement).value = '';
            }}
          />
        </Button>
      </Box>

      {parsedData.length > 0 && columns && (
        <ExcelPreviewList
          ref={excelPreviewListRef}
          key={uploadKey}
          data={parsedData as any}
          columns={displayColumns as any}
          rowIdGetter={rowIdGetter as any}
          readOnlyFields={readOnlyFields}
          selectFields={selectFields}
          dateFields={dateFields}
          dateFormat={dateFormat}
          validator={validator as any}
          getDynamicSelectOptions={getDynamicSelectOptions as any}
          dynamicSelectFields={dynamicSelectFields}
          onProcessRowUpdate={onProcessRowUpdate || (rowSanitizer as any)}
          getRequiredFields={getRequiredFields as any}
          onDataChange={handleDataChange}
          onAddRow={handleAddRow}
        />
      )}

      <CreateDataActions
        onSave={handleSave}
        onCancel={onCancel}
        saveLabel={saveLabel}
        cancelLabel={cancelLabel}
        size={size}
        isLoading={isLoading}
        disabled={!selectedFile || parsedData.length === 0}
      />
    </Stack>
  );
};

export default ExcelUpload;
