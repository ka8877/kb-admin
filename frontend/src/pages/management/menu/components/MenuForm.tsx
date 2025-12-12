// frontend/src/pages/management/menu/components/MenuForm.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Stack, TextField, MenuItem, Typography, Paper } from '@mui/material';
import MediumButton from '@/components/common/button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { MenuScreenItem } from '../types';
import { MenuValidator } from '../validation';

const INITIAL_FORM_DATA: Partial<MenuScreenItem> = {
  screen_id: '',
  screen_name: '',
  path: '',
  depth: 0,
  order: 1,
  parent_screen_id: '',
  screen_type: '페이지',
  display_yn: 'N',
};

const SCREEN_TYPE_OPTIONS = [
  { value: '메뉴', label: '메뉴' },
  { value: '페이지', label: '페이지' },
  { value: '기능', label: '기능' },
] as const;

const DISPLAY_OPTIONS = [
  { value: 'Y', label: '표시' },
  { value: 'N', label: '숨김' },
] as const;

type MenuFormProps = {
  menuItem: MenuScreenItem | null;
  allMenuItems: MenuScreenItem[]; // 상위화면 선택을 위한 전체 메뉴 목록
  isNew?: boolean;
  onSave: (menuItem: MenuScreenItem) => void;
  onCancel: () => void;
  onDelete?: (id: string | number) => void;
  disabled?: boolean;
};

const MenuForm: React.FC<MenuFormProps> = ({
  menuItem,
  allMenuItems,
  isNew = false,
  onSave,
  onCancel,
  onDelete,
  disabled = false,
}) => {
  const { showConfirm } = useConfirmDialog();
  const [formData, setFormData] = useState<Partial<MenuScreenItem>>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (menuItem) {
      setFormData({
        screen_id: menuItem.screen_id,
        screen_name: menuItem.screen_name,
        path: menuItem.path,
        depth: menuItem.depth,
        order: menuItem.order,
        parent_screen_id: menuItem.parent_screen_id || '',
        screen_type: menuItem.screen_type,
        display_yn: menuItem.display_yn,
      });
    } else if (isNew) {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({}); // 에러 초기화
  }, [menuItem, isNew]);

  const handleChange = useCallback((field: keyof MenuScreenItem, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 필드 변경 시 해당 필드의 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleSave = useCallback(async () => {
    // Validation 체크
    const validationResult = MenuValidator.validateMenuForm(formData, isNew);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    // 화면 ID 중복 체크
    if (isNew) {
      const isDuplicate = await MenuValidator.checkDuplicateScreenId(
        formData.screen_id!,
        allMenuItems,
        menuItem?.id,
      );
      if (isDuplicate) {
        setErrors({ screen_id: '이미 존재하는 화면 ID입니다.' });
        return;
      }
    }

    // 순환 참조 체크
    if (formData.parent_screen_id) {
      const hasCircular = MenuValidator.checkCircularReference(
        menuItem?.id || Date.now(),
        formData.parent_screen_id,
        allMenuItems,
      );
      if (hasCircular) {
        setErrors({ parent_screen_id: '순환 참조가 발생합니다.' });
        return;
      }
    }

    const savedData: MenuScreenItem = {
      id: menuItem?.id || Date.now(),
      screen_id: formData.screen_id!,
      screen_name: formData.screen_name!,
      path: formData.path!,
      depth: formData.depth || 0,
      order: formData.order || 1,
      parent_screen_id: formData.parent_screen_id || undefined,
      screen_type: formData.screen_type || '페이지',
      display_yn: formData.display_yn || 'Y',
      created_at: menuItem?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(savedData);
  }, [formData, menuItem, onSave, isNew, allMenuItems]);

  const handleDelete = useCallback(() => {
    if (menuItem && onDelete) {
      showConfirm({
        title: '삭제 확인',
        message: '정말 삭제하시겠습니까?',
        onConfirm: () => {
          onDelete(menuItem.id);
        },
      });
    }
  }, [menuItem, onDelete, showConfirm]);

  if (!menuItem && !isNew) {
    return null;
  }

  // 상위 메뉴 선택 옵션 (자기 자신은 제외)
  const parentOptions = allMenuItems.filter((item) => item.id !== menuItem?.id);

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          {isNew ? '메뉴 추가' : '메뉴 수정'}
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            화면 ID *
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.screen_id || ''}
            onChange={(e) => handleChange('screen_id', e.target.value)}
            placeholder="화면 ID를 입력하세요"
            disabled={!isNew || disabled}
            error={!!errors.screen_id}
            helperText={errors.screen_id}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            화면명 *
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.screen_name || ''}
            onChange={(e) => handleChange('screen_name', e.target.value)}
            placeholder="화면명을 입력하세요"
            disabled={disabled}
            error={!!errors.screen_name}
            helperText={errors.screen_name}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            PATH *
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.path || ''}
            onChange={(e) => handleChange('path', e.target.value)}
            placeholder="/management/menu"
            disabled={disabled}
            error={!!errors.path}
            helperText={errors.path}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              DEPTH
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={formData.depth ?? 0}
              onChange={(e) => handleChange('depth', parseInt(e.target.value) || 0)}
              disabled={disabled}
              inputProps={{ min: 0 }}
              error={!!errors.depth}
              helperText={errors.depth}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              순서
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={formData.order ?? 1}
              onChange={(e) => handleChange('order', parseInt(e.target.value) || 1)}
              disabled={disabled}
              inputProps={{ min: 1 }}
              error={!!errors.order}
              helperText={errors.order}
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            상위화면 ID
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={formData.parent_screen_id || ''}
            onChange={(e) => handleChange('parent_screen_id', e.target.value)}
            disabled={disabled}
            error={!!errors.parent_screen_id}
            helperText={errors.parent_screen_id}
          >
            <MenuItem value="">
              <em>없음 (최상위)</em>
            </MenuItem>
            {parentOptions.map((option) => (
              <MenuItem key={option.id} value={option.screen_id}>
                {option.screen_name} ({option.screen_id})
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            화면타입
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={formData.screen_type || '페이지'}
            onChange={(e) => handleChange('screen_type', e.target.value)}
            disabled={disabled}
            error={!!errors.screen_type}
            helperText={errors.screen_type}
          >
            {SCREEN_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            표시여부
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={formData.display_yn || 'N'}
            onChange={(e) => handleChange('display_yn', e.target.value)}
            disabled={isNew || disabled}
            error={!!errors.display_yn}
            helperText={isNew ? '화면 추가 후 표시로 변경' : errors.display_yn}
          >
            {DISPLAY_OPTIONS.map((option) => (
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

export default MenuForm;
