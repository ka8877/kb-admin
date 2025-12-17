// frontend/src/pages/management/menu/components/MenuForm.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Stack, TextField, MenuItem, Typography, Paper } from '@mui/material';
import MediumButton from '@/components/common/button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { MenuItem as MenuItemType } from '../types';

const INITIAL_FORM_DATA: Partial<MenuItemType> = {
  menu_code: '',
  menu_name: '',
  menu_path: null,
  sort_order: 1,
  parent_menu_code: undefined,
  is_active: 0,
};

const DISPLAY_OPTIONS = [
  { value: 1, label: '표시' },
  { value: 0, label: '숨김' },
] as const;

type MenuFormProps = {
  menuItem: MenuItemType | null;
  allMenuItems: MenuItemType[]; // 상위화면 선택을 위한 전체 메뉴 목록
  isNew?: boolean;
  onSave: (menuItem: MenuItemType) => void;
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
  const [formData, setFormData] = useState<Partial<MenuItemType>>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (menuItem) {
      setFormData({
        menu_code: menuItem.menu_code,
        menu_name: menuItem.menu_name,
        menu_path: menuItem.menu_path,
        sort_order: menuItem.sort_order,
        parent_menu_code: menuItem.parent_menu_code || undefined,
        is_active: menuItem.is_active,
      });
    } else if (isNew) {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({}); // 에러 초기화
  }, [menuItem, isNew]);

  const handleChange = useCallback((field: keyof MenuItemType, value: string | number | null) => {
    setFormData((prev: Partial<MenuItemType>) => ({ ...prev, [field]: value }));
    // 필드 변경 시 해당 필드의 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const handleSave = useCallback(async () => {
    // 필수 필드 체크
    if (!formData.menu_code || !formData.menu_name) {
      setErrors({
        menu_code: !formData.menu_code ? '메뉴 코드를 입력하세요' : '',
        menu_name: !formData.menu_name ? '메뉴명을 입력하세요' : '',
      });
      return;
    }

    const savedData: MenuItemType = {
      menu_code: formData.menu_code,
      menu_name: formData.menu_name,
      menu_path: formData.menu_path || null,
      sort_order: formData.sort_order || 1,
      parent_menu_code: formData.parent_menu_code || null,
      is_active: formData.is_active || 0,
      created_by: menuItem?.created_by || 1,
      created_at: menuItem?.created_at || new Date().toISOString(),
      updated_by: 1,
      updated_at: new Date().toISOString(),
      firebaseKey: menuItem?.firebaseKey || undefined,
    };

    onSave(savedData);
  }, [formData, menuItem, onSave]);

  const handleDelete = useCallback(() => {
    if (menuItem && onDelete) {
      showConfirm({
        title: '삭제 확인',
        message: '정말 삭제하시겠습니까?',
        onConfirm: () => {
          onDelete(menuItem.firebaseKey || '');
        },
      });
    }
  }, [menuItem, onDelete, showConfirm]);

  if (!menuItem && !isNew) {
    return null;
  }

  // 상위 메뉴 선택 옵션 (자기 자신은 제외)
  const parentOptions = allMenuItems.filter((item) => item.firebaseKey !== menuItem?.firebaseKey);

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          {isNew ? '메뉴 추가' : '메뉴 수정'}
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            메뉴 코드 *
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.menu_code || ''}
            onChange={(e) => handleChange('menu_code', e.target.value)}
            placeholder="메뉴 코드를 입력하세요"
            disabled={!isNew || disabled}
            error={!!errors.menu_code}
            helperText={errors.menu_code}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            메뉴명 *
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.menu_name || ''}
            onChange={(e) => handleChange('menu_name', e.target.value)}
            placeholder="메뉴명을 입력하세요"
            disabled={disabled}
            error={!!errors.menu_name}
            helperText={errors.menu_name}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            라우트 경로
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.menu_path || ''}
            onChange={(e) => handleChange('menu_path', e.target.value)}
            placeholder="/management/menu"
            disabled={disabled}
            error={!!errors.menu_path}
            helperText={errors.menu_path}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            정렬 순서
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={formData.sort_order ?? 1}
            onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 1)}
            disabled={disabled}
            inputProps={{ min: 1 }}
            error={!!errors.sort_order}
            helperText={errors.sort_order}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            상위메뉴 코드
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={formData.parent_menu_code || ''}
            onChange={(e) => handleChange('parent_menu_code', e.target.value || null)}
            disabled={disabled}
            error={!!errors.parent_menu_code}
            helperText={errors.parent_menu_code}
          >
            <MenuItem value="">
              <em>없음 (최상위)</em>
            </MenuItem>
            {parentOptions.map((option) => (
              <MenuItem key={option.firebaseKey} value={option.menu_code}>
                {option.menu_name} ({option.menu_code})
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
            value={formData.is_active || 0}
            onChange={(e) => handleChange('is_active', parseInt(e.target.value))}
            disabled={isNew || disabled}
            error={!!errors.is_active}
            helperText={isNew ? '화면 추가 후 표시로 변경' : errors.is_active}
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
                subType="d"
              >
                삭제
              </MediumButton>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
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
        </Box>
      </Stack>
    </Paper>
  );
};

export default MenuForm;
