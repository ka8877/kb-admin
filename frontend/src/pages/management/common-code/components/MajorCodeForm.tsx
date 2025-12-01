import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Stack,
  TextField,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import MediumButton from '@/components/common/button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { CodeTypeOption } from '@/mocks/commonCodeDb';

type MajorCodeFormProps = {
  selectedItem: CodeTypeOption | null;
  isNew: boolean;
  onSave: (item: CodeTypeOption) => void;
  onCancel: () => void;
  onDelete: (value: string) => void;
  disabled?: boolean;
};

const INITIAL_DATA: CodeTypeOption = {
  value: '',
  label: '',
  useYn: 'Y',
};

const MajorCodeForm: React.FC<MajorCodeFormProps> = ({
  selectedItem,
  isNew,
  onSave,
  onCancel,
  onDelete,
  disabled = false,
}) => {
  const { showConfirm } = useConfirmDialog();
  const [formData, setFormData] = useState<CodeTypeOption>(INITIAL_DATA);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedItem) {
      setFormData(selectedItem);
    } else if (isNew) {
      setFormData(INITIAL_DATA);
    }
    setFieldErrors({});
  }, [selectedItem, isNew]);

  const handleChange = useCallback((field: keyof CodeTypeOption, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 입력시 해당 필드 오류 제거
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateAndShowErrors = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.value || !formData.value.trim()) {
      errors.value = '코드 타입 ID는 필수입니다';
    }

    if (!formData.label || !formData.label.trim()) {
      errors.label = '코드 타입 명은 필수입니다';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(() => {
    if (!validateAndShowErrors()) {
      return;
    }
    onSave(formData);
  }, [formData, onSave, validateAndShowErrors]);

  const handleDelete = useCallback(() => {
    if (selectedItem) {
      showConfirm({
        title: '삭제 확인',
        message: '정말 삭제하시겠습니까?',
        onConfirm: () => {
          onDelete(selectedItem.value);
        },
      });
    }
  }, [selectedItem, onDelete, showConfirm]);

  if (!selectedItem && !isNew) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary', height: '100%' }}>
        코드 타입을 선택하거나 추가하세요
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          {isNew ? '코드 타입 추가' : '코드 타입 수정'}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              코드 타입 ID *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.value || ''}
              onChange={(e) => handleChange('value', e.target.value)}
              disabled={!isNew || disabled}
              placeholder="예: SERVICE_NAME"
              error={!!fieldErrors.value}
              helperText={fieldErrors.value}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              코드 타입 명 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              disabled={disabled}
              placeholder="예: 서비스명"
              error={!!fieldErrors.label}
              helperText={fieldErrors.label}
            />
          </Box>
        </Stack>

        <Box>
          <Typography variant="caption" color="text.secondary">
            사용 여부
          </Typography>
          <RadioGroup
            row
            value={formData.useYn || 'Y'}
            onChange={(e) => handleChange('useYn', e.target.value)}
          >
            <FormControlLabel
              value="Y"
              control={<Radio size="small" />}
              label="사용"
              disabled={disabled}
            />
            <FormControlLabel
              value="N"
              control={<Radio size="small" />}
              label="미사용"
              disabled={disabled}
            />
          </RadioGroup>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          {!isNew && (
            <MediumButton
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={disabled}
            >
              삭제
            </MediumButton>
          )}
          <MediumButton variant="outlined" onClick={onCancel} disabled={disabled}>
            취소
          </MediumButton>
          <MediumButton variant="contained" onClick={handleSave} disabled={disabled}>
            저장
          </MediumButton>
        </Box>
      </Stack>
    </Paper>
  );
};

export default MajorCodeForm;
