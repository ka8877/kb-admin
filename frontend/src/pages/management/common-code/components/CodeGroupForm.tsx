import React, { useEffect, useState, useCallback } from 'react';
import { Box, Stack, TextField, Typography, Paper, MenuItem } from '@mui/material';
import MediumButton from '@/components/common/button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES } from '@/constants/message';
import type { CodeGroup } from '../types';
import { CodeGroupValidator } from '../validation/commonCodeValidation';
import Section from '@/components/layout/Section';

type CodeGroupFormProps = {
  selectedItem: CodeGroup | null;
  isNew: boolean;
  onSave: (
    item: Omit<
      CodeGroup,
      'code_group_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at'
    >,
  ) => void;
  onCancel: () => void;
  onDelete: (codeGroupId: number) => void;
  disabled?: boolean;
};

const INITIAL_DATA = {
  group_code: '',
  group_name: '',
  is_active: 1,
};

const CodeGroupForm: React.FC<CodeGroupFormProps> = ({
  selectedItem,
  isNew,
  onSave,
  onCancel,
  onDelete,
  disabled = false,
}) => {
  const { showConfirm } = useConfirmDialog();
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        group_code: selectedItem.group_code,
        group_name: selectedItem.group_name,
        is_active: selectedItem.is_active,
      });
    } else if (isNew) {
      setFormData(INITIAL_DATA);
    }
    setFieldErrors({});
  }, [selectedItem, isNew]);

  const handleChange = useCallback((field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateAndShowErrors = useCallback((): boolean => {
    const validationResults = CodeGroupValidator.validateByField(formData);
    const errors: Record<string, string> = {};

    Object.entries(validationResults).forEach(([field, result]) => {
      if (!result.isValid && result.message) {
        errors[field] = result.message;
      }
    });

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
        title: CONFIRM_TITLES.DELETE,
        message: CONFIRM_MESSAGES.DELETE_CODE_GROUP,
        onConfirm: () => {
          onDelete(selectedItem.code_group_id);
        },
      });
    }
  }, [selectedItem, onDelete, showConfirm]);

  if (!selectedItem && !isNew) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary', height: '100%' }}>
        코드그룹을 선택하거나 추가하세요
      </Paper>
    );
  }

  return (
    <Section>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          {isNew ? '코드그룹 추가' : '코드그룹 수정'}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="그룹코드"
              value={formData.group_code || ''}
              onChange={(e) => handleChange('group_code', e.target.value)}
              disabled={!isNew || disabled}
              placeholder="예: SERVICE_TYPE"
              required
              error={!!fieldErrors.group_code}
              helperText={fieldErrors.group_code}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="그룹명"
              value={formData.group_name || ''}
              onChange={(e) => handleChange('group_name', e.target.value)}
              disabled={disabled}
              placeholder="예: 서비스 타입"
              required
              error={!!fieldErrors.group_name}
              helperText={fieldErrors.group_name}
            />
          </Box>
        </Stack>

        <Box>
          <TextField
            select
            fullWidth
            size="small"
            label="사용여부"
            value={formData.is_active}
            onChange={(e) => handleChange('is_active', Number(e.target.value))}
            disabled={disabled}
            required
          >
            <MenuItem value={1}>사용</MenuItem>
            <MenuItem value={0}>미사용</MenuItem>
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
    </Section>
  );
};

export default CodeGroupForm;
