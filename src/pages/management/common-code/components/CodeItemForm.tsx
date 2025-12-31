import React, { useEffect, useState, useCallback } from 'react';
import { Box, Stack, TextField, MenuItem, Typography, Paper } from '@mui/material';
import MediumButton from '@/components/common/button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES } from '@/constants/message';
import type { CodeItem, CodeItemDisplay } from '../types';
import { CodeItemValidator } from '../validation/commonCodeValidation';
import Section from '@/components/layout/Section';

type CodeItemFormProps = {
  selectedItem: CodeItemDisplay | null;
  isNew: boolean;
  selectedCodeGroupId: number | null;
  groupCode?: string; // 코드그룹 코드 (service_nm 등)
  initialSortOrder?: number; // 추가 시 기본 정렬순서
  onSave: (item: Omit<CodeItem, 'codeItemId'>) => void;
  onCancel: () => void;
  onDelete: (codeItemId: number) => void;
  disabled?: boolean;
};

const INITIAL_DATA = {
  code: '',
  codeName: '',
  sortOrder: 0,
  isActive: true,
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
        code: selectedItem.code,
        codeName: selectedItem.codeName,
        sortOrder: selectedItem.sortOrder,
        isActive: selectedItem.isActive,
      });
    } else if (isNew && selectedCodeGroupId !== null && selectedCodeGroupId !== undefined) {
      setFormData({
        ...INITIAL_DATA,
        sortOrder: initialSortOrder,
      });
    }
    setFieldErrors({});
  }, [selectedItem, isNew, selectedCodeGroupId, initialSortOrder]);

  const handleChange = useCallback((field: string, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateAndShowErrors = useCallback((): boolean => {
    const validationResults = CodeItemValidator.validateByField(formData, groupCode);
    const errors: Record<string, string> = {};

    Object.entries(validationResults).forEach(([field, result]) => {
      if (!result.isValid && result.message) {
        errors[field] = result.message;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, groupCode]);

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
          onDelete(selectedItem.codeItemId);
        },
      });
    }
  }, [selectedItem, onDelete, showConfirm]);

  if (!selectedItem && !isNew) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary', height: '100%' }}>
        코드아이템을 선택하거나 추가하세요
      </Paper>
    );
  }

  return (
    <Section>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          {isNew ? '코드아이템 추가' : '코드아이템 수정'}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="코드명"
              value={formData.codeName || ''}
              onChange={(e) => handleChange('codeName', e.target.value)}
              disabled={disabled}
              placeholder="코드명 입력"
              required
              error={!!fieldErrors.codeName}
              helperText={fieldErrors.codeName}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="정렬순서"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => handleChange('sortOrder', Number(e.target.value))}
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
              label="사용여부"
              value={formData.isActive ? '1' : '0'}
              onChange={(e) => handleChange('isActive', e.target.value === '1')}
              disabled={disabled}
              required
            >
              <MenuItem value="1">사용</MenuItem>
              <MenuItem value="0">미사용</MenuItem>
            </TextField>
          </Box>
          {groupCode === 'service_nm' && (
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="서비스코드"
                value={formData.code || ''}
                onChange={(e) => handleChange('code', e.target.value)}
                disabled={disabled}
                placeholder="서비스코드 입력"
                error={!!fieldErrors.code}
                helperText={fieldErrors.code || '서비스코드 값을 입력하세요 (예: service_01)'}
                required
              />
            </Box>
          )}
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
              삭제
            </MediumButton>
          )}
          <MediumButton variant="outlined" onClick={onCancel} disabled={disabled} subType="etc">
            취소
          </MediumButton>
          <MediumButton
            variant="contained"
            onClick={handleSave}
            disabled={disabled}
            subType={isNew ? 'c' : 'u'}
          >
            저장
          </MediumButton>
        </Box>
      </Stack>
    </Section>
  );
};

export default CodeItemForm;
