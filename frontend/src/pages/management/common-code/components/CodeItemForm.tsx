import React, { useEffect, useState, useCallback } from 'react';
import { Box, Stack, TextField, MenuItem, Typography, Paper } from '@mui/material';
import MediumButton from '@/components/common/button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES, COMMON_CODE_MESSAGES } from '@/constants/message';
import type { CodeItem, CodeItemDisplay } from '../types';
import { CodeItemValidator } from '../validation/commonCodeValidation';
import Section from '@/components/layout/Section';

type CodeItemFormProps = {
  selectedItem: CodeItemDisplay | null;
  isNew: boolean;
  selectedCodeGroupId: number | null;
  groupCode?: string; // 코드그룹 코드 (service_nm 등)
  initialSortOrder?: number; // 추가 시 기본 정렬순서
  onSave: (
    item: Omit<
      CodeItem,
      'code_item_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at'
    >,
  ) => void;
  onCancel: () => void;
  onDelete: (codeItemId: number) => void;
  disabled?: boolean;
};

const INITIAL_DATA = {
  code_group_id: 0,
  code: '',
  code_name: '',
  sort_order: 0,
  is_active: 1,
};

const CodeItemForm: React.FC<CodeItemFormProps> = ({
  selectedItem,
  isNew,
  selectedCodeGroupId,
  groupCode,
  initialSortOrder = 0,
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
        code_group_id: selectedItem.code_group_id,
        code: selectedItem.code,
        code_name: selectedItem.code_name,
        sort_order: selectedItem.sort_order,
        is_active: selectedItem.is_active,
      });
    } else if (isNew && selectedCodeGroupId !== null && selectedCodeGroupId !== undefined) {
      setFormData({
        ...INITIAL_DATA,
        code_group_id: selectedCodeGroupId,
        sort_order: initialSortOrder,
      });
    }
    setFieldErrors({});
  }, [selectedItem, isNew, selectedCodeGroupId, initialSortOrder]);

  const handleChange = useCallback((field: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateAndShowErrors = useCallback((): boolean => {
    const validationResults = CodeItemValidator.validateByField(formData);
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
        message: CONFIRM_MESSAGES.DELETE,
        onConfirm: () => {
          onDelete(selectedItem.code_item_id);
        },
      });
    }
  }, [selectedItem, onDelete, showConfirm]);

  if (!selectedItem && !isNew) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary', height: '100%' }}>
        {COMMON_CODE_MESSAGES.SELECT_OR_ADD_CODE_ITEM}
      </Paper>
    );
  }

  return (
    <Section>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          {isNew ? COMMON_CODE_MESSAGES.ADD_CODE_ITEM : COMMON_CODE_MESSAGES.EDIT_CODE_ITEM}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              label={COMMON_CODE_MESSAGES.FIELD_CODE_NAME}
              value={formData.code_name || ''}
              onChange={(e) => handleChange('code_name', e.target.value)}
              disabled={disabled}
              placeholder={COMMON_CODE_MESSAGES.CODE_NAME_PLACEHOLDER}
              required
              error={!!fieldErrors.code_name}
              helperText={fieldErrors.code_name}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              label={COMMON_CODE_MESSAGES.FIELD_SORT_ORDER}
              type="number"
              value={formData.sort_order}
              onChange={(e) => handleChange('sort_order', Number(e.target.value))}
              disabled={disabled}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={COMMON_CODE_MESSAGES.FIELD_IS_ACTIVE}
              value={formData.is_active}
              onChange={(e) => handleChange('is_active', Number(e.target.value))}
              disabled={disabled}
              required
            >
              <MenuItem value={1}>{COMMON_CODE_MESSAGES.ACTIVE}</MenuItem>
              <MenuItem value={0}>{COMMON_CODE_MESSAGES.INACTIVE}</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              label={
                groupCode === 'service_nm'
                  ? COMMON_CODE_MESSAGES.FIELD_SERVICE_CODE
                  : COMMON_CODE_MESSAGES.FIELD_CODE_OPTIONAL
              }
              value={formData.code || ''}
              onChange={(e) => handleChange('code', e.target.value)}
              disabled={disabled}
              placeholder={
                groupCode === 'service_nm'
                  ? COMMON_CODE_MESSAGES.SERVICE_CODE_PLACEHOLDER
                  : COMMON_CODE_MESSAGES.CODE_AUTO_GENERATED
              }
              error={!!fieldErrors.code}
              helperText={
                fieldErrors.code ||
                (groupCode === 'service_nm'
                  ? COMMON_CODE_MESSAGES.SERVICE_CODE_HELP
                  : COMMON_CODE_MESSAGES.CODE_AUTO_GENERATED_HELP)
              }
              required={groupCode === 'service_nm'}
            />
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          {!isNew && (
            <MediumButton
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={disabled}
              subType="d"
            >
              {COMMON_CODE_MESSAGES.DELETE}
            </MediumButton>
          )}
          <MediumButton variant="outlined" onClick={onCancel} disabled={disabled} subType="etc">
            {COMMON_CODE_MESSAGES.CANCEL}
          </MediumButton>
          <MediumButton
            variant="contained"
            onClick={handleSave}
            disabled={disabled}
            subType={isNew ? 'c' : 'u'}
          >
            {COMMON_CODE_MESSAGES.SAVE}
          </MediumButton>
        </Box>
      </Stack>
    </Section>
  );
};

export default CodeItemForm;
