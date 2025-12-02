import React, { useEffect, useState, useCallback } from 'react';
import { Box, Stack, TextField, MenuItem, Typography, Paper } from '@mui/material';
import MediumButton from '@/components/common/button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { RowItem } from '../types';

type MinorCodeFormProps = {
  selectedItem: RowItem | null;
  isNew: boolean;
  selectedCodeType: string | null;
  onSave: (item: RowItem) => void;
  onCancel: () => void;
  onDelete: (service_cd: string) => void;
  disabled?: boolean;
};

const INITIAL_DATA: Partial<RowItem> = {
  service_cd: '',
  category_nm: '',
  status_code: 'Y',
  parent_service_cd: '',
};

const MinorCodeForm: React.FC<MinorCodeFormProps> = ({
  selectedItem,
  isNew,
  selectedCodeType,
  onSave,
  onCancel,
  onDelete,
  disabled = false,
}) => {
  const { showConfirm } = useConfirmDialog();
  const [formData, setFormData] = useState<Partial<RowItem>>(INITIAL_DATA);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedItem) {
      setFormData(selectedItem);
    } else if (isNew) {
      setFormData({
        ...INITIAL_DATA,
        code_type: selectedCodeType || '',
      });
    }
    setFieldErrors({});
  }, [selectedItem, isNew, selectedCodeType]);

  const handleChange = useCallback((field: keyof RowItem, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 입력시 해당 필드 오류 제거
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateAndShowErrors = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.service_cd || !formData.service_cd.trim()) {
      errors.service_cd = '코드는 필수입니다';
    }

    if (!formData.category_nm || !formData.category_nm.trim()) {
      errors.category_nm = '코드명은 필수입니다';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(() => {
    if (!validateAndShowErrors()) {
      return;
    }
    onSave(formData as RowItem);
  }, [formData, onSave, validateAndShowErrors]);

  const handleDelete = useCallback(() => {
    if (selectedItem) {
      showConfirm({
        title: '삭제 확인',
        message: '정말 삭제하시겠습니까?',
        onConfirm: () => {
          onDelete(selectedItem.service_cd);
        },
      });
    }
  }, [selectedItem, onDelete, showConfirm]);

  if (!selectedCodeType) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary', height: '100%' }}>
        대분류(코드 타입)를 먼저 선택해주세요
      </Paper>
    );
  }

  if (!selectedItem && !isNew) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary', height: '100%' }}>
        소분류 코드를 선택하거나 추가하세요
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          {isNew ? '소분류 코드 추가' : '소분류 코드 수정'}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              코드 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.service_cd || ''}
              onChange={(e) => handleChange('service_cd', e.target.value)}
              disabled={!isNew || disabled}
              placeholder="코드 입력"
              error={!!fieldErrors.service_cd}
              helperText={fieldErrors.service_cd}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              코드명 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.category_nm || ''}
              onChange={(e) => handleChange('category_nm', e.target.value)}
              disabled={disabled}
              placeholder="코드명 입력"
              error={!!fieldErrors.category_nm}
              helperText={fieldErrors.category_nm}
            />
          </Box>
        </Stack>

        {selectedCodeType === 'QUESTION_CATEGORY' && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              상위 서비스 코드
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.parent_service_cd || ''}
              onChange={(e) => handleChange('parent_service_cd', e.target.value)}
              disabled={disabled}
              placeholder="상위 서비스 코드 입력"
            />
          </Box>
        )}

        <Box>
          <Typography variant="caption" color="text.secondary">
            사용여부 *
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={formData.status_code || 'Y'}
            onChange={(e) => handleChange('status_code', e.target.value)}
            disabled={disabled}
          >
            <MenuItem value="Y">사용</MenuItem>
            <MenuItem value="N">미사용</MenuItem>
          </TextField>
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

export default MinorCodeForm;
