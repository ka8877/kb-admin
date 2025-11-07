// frontend/src/components/common/upload/ExcelUpload.tsx
import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import CreateDataActions from '../actions/CreateDataActions';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useAlertDialog } from '../../../hooks/useAlertDialog';
import ExcelJS from 'exceljs';

export type ExcelUploadProps = {
  onSave: (file: File) => void;
  onCancel: () => void;
  columns?: GridColDef[]; // 템플릿 생성을 위한 컬럼 정의
  templateFileName?: string; // 템플릿 파일명
  exampleData?: any[]; // 예시 데이터 (선택적)
  fieldGuides?: Record<string, string>; // 각 필드별 작성 가이드
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setSelectedFile(file);
      // 파일 선택 성공 알림
      showAlert({
        title: '파일 선택 완료',
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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
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
      setSelectedFile(file);
      // 파일 선택 성공 알림
      showAlert({
        title: '파일 선택 완료',
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
      for (let i = 0; i < 5; i++) {
        worksheet.addRow(fields.map(() => ''));
      }

      // 열 너비 자동 조정
      worksheet.columns = columns.map((col) => {
        const headerLength = (col.headerName || col.field).length;
        const width = Math.min(Math.max(headerLength * 2, 15), 50);
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
