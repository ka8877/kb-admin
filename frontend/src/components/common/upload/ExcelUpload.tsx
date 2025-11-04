// frontend/src/components/common/upload/ExcelUpload.tsx
import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Stack } from '@mui/material';
import CreateDataActions from '../actions/CreateDataActions';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useAlertDialog } from '../../../hooks/useAlertDialog';

export type ExcelUploadProps = {
  onSave: (file: File) => void;
  onCancel: () => void;
  acceptedFormats?: string[];
  title?: string;
  description?: string;
  templateLabel?: string;
  onTemplateDownload?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
};

const ExcelUpload: React.FC<ExcelUploadProps> = ({
  onSave,
  onCancel,
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

          {onTemplateDownload && (
            <Box sx={{ textAlign: 'center' }}>
              <Button variant="text" size="small" sx={{ mb: 1 }} onClick={onTemplateDownload}>
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
