import React, { useCallback, useEffect, useState } from 'react';
import { Box, Stack, TextField, MenuItem, Paper, Typography } from '@mui/material';
import MediumButton from '@/components/common/button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { PermissionItem } from '../types';
import { PermissionValidator } from '../validation/permissionValidation';

// 상수
const INITIAL_FORM_DATA: Partial<PermissionItem> = {
  permission_id: '',
  permission_name: '',
  status: '활성',
};

const STATUS_OPTIONS = [
  { value: '활성', label: '활성' },
  { value: '비활성', label: '비활성' },
] as const;

const MESSAGES = {
  DELETE_CONFIRM: '정말 삭제하시겠습니까?',
} as const;

type PermissionFormProps = {
  permission: PermissionItem | null;
  isNew?: boolean;
  onSave: (permission: PermissionItem) => void;
  onCancel: () => void;
  onDelete?: (id: string | number) => void;
  disabled?: boolean;
};

const PermissionForm: React.FC<PermissionFormProps> = ({
  permission,
  isNew = false,
  onSave,
  onCancel,
  onDelete,
  disabled = false,
}) => {
  const { showConfirm } = useConfirmDialog();
  const [formData, setFormData] = useState<Partial<PermissionItem>>(INITIAL_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (permission) {
      setFormData({
        permission_id: permission.permission_id,
        permission_name: permission.permission_name,
        status: permission.status,
      });
    } else if (isNew) {
      setFormData(INITIAL_FORM_DATA);
    }
    setFieldErrors({});
  }, [permission, isNew]);

  const handleChange = useCallback((field: keyof PermissionItem, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 입력시 해당 필드 오류 제거
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateAndShowErrors = useCallback((): boolean => {
    const fieldValidationResults = PermissionValidator.validateByField({
      permission_id: formData.permission_id || '',
      permission_name: formData.permission_name || '',
      status: formData.status || '활성',
    });

    const errors: Record<string, string> = {};
    let hasErrors = false;

    Object.entries(fieldValidationResults).forEach(([field, result]) => {
      if (!result.isValid && result.message) {
        errors[field] = result.message;
        hasErrors = true;
      }
    });

    setFieldErrors(errors);
    return !hasErrors;
  }, [formData]);

  const handleSave = useCallback(() => {
    if (!validateAndShowErrors()) {
      return;
    }

    const savedData: PermissionItem = {
      id: permission?.id || Date.now(),
      permission_id: formData.permission_id!,
      permission_name: formData.permission_name!,
      status: formData.status || '활성',
      created_at: permission?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(savedData);
  }, [formData, permission, onSave, validateAndShowErrors]);

  const handleDelete = useCallback(() => {
    if (permission && onDelete) {
      showConfirm({
        title: '삭제 확인',
        message: MESSAGES.DELETE_CONFIRM,
        onConfirm: () => {
          onDelete(permission.id);
        },
      });
    }
  }, [permission, onDelete, showConfirm]);

  if (!permission && !isNew) {
    return null;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Typography variant="h6" fontWeight="bold">
          {isNew ? '권한 추가' : '권한 수정'}
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            권한 ID *
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.permission_id || ''}
            onChange={(e) => handleChange('permission_id', e.target.value)}
            placeholder="권한 ID를 입력하세요"
            disabled={!isNew || disabled}
            error={!!fieldErrors.permission_id}
            helperText={fieldErrors.permission_id}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            권한명 *
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.permission_name || ''}
            onChange={(e) => handleChange('permission_name', e.target.value)}
            placeholder="권한명을 입력하세요"
            disabled={disabled}
            error={!!fieldErrors.permission_name}
            helperText={fieldErrors.permission_name}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            등록상태 *
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={formData.status || '활성'}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={disabled}
            error={!!fieldErrors.status}
            helperText={fieldErrors.status}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
          <Box>
            {!isNew && onDelete && (
              <MediumButton
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={disabled}
              >
                삭제
              </MediumButton>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <MediumButton variant="outlined" onClick={onCancel} disabled={disabled}>
              취소
            </MediumButton>
            <MediumButton variant="contained" onClick={handleSave} disabled={disabled}>
              저장
            </MediumButton>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PermissionForm;
