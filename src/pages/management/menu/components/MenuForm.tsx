// frontend/src/pages/management/menu/components/MenuForm.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Stack, TextField, MenuItem, Typography, Paper } from '@mui/material';
import MediumButton from '@/components/common/button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { MenuItem as MenuItemType } from '../types';

const INITIAL_FORM_DATA: Partial<MenuItemType> = {
  menuCode: '',
  menuName: '',
  menuPath: null,
  sortOrder: 1,
  parentMenuCode: undefined,
  isActive: false,
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
        menuCode: menuItem.menuCode,
        menuName: menuItem.menuName,
        menuPath: menuItem.menuPath,
        sortOrder: menuItem.sortOrder,
        parentMenuCode: menuItem.parentMenuCode || undefined,
        isActive: menuItem.isActive,
      });
    } else if (isNew) {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({}); // 에러 초기화
  }, [menuItem, isNew]);

  const handleChange = useCallback((field: keyof MenuItemType, value: string | number | null) => {
    let processedValue: string | number | boolean | null = value;

    // isActive는 boolean으로 변환
    if (field === 'isActive') {
      processedValue = value === 1 || value === '1';
    }

    setFormData((prev: Partial<MenuItemType>) => ({ ...prev, [field]: processedValue }));
    // 필드 변경 시 해당 필드의 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const handleSave = useCallback(async () => {
    // 필수 필드 체크
    if (!formData.menuCode || !formData.menuName) {
      setErrors({
        menuCode: !formData.menuCode ? '메뉴 코드를 입력하세요' : '',
        menuName: !formData.menuName ? '메뉴명을 입력하세요' : '',
      });
      return;
    }

    const savedData: MenuItemType = {
      ...(menuItem?.menuId && { menuId: menuItem.menuId }),
      menuCode: formData.menuCode,
      menuName: formData.menuName,
      menuPath: formData.menuPath || null,
      sortOrder: formData.sortOrder || 1,
      parentMenuCode: formData.parentMenuCode || null,
      depth: menuItem?.depth || 1,
      isVisible: menuItem?.isVisible ?? true,
      isActive: formData.isActive ?? true,
    } as MenuItemType;

    onSave(savedData);
  }, [formData, menuItem, onSave]);

  const handleDelete = useCallback(() => {
    if (menuItem && onDelete) {
      showConfirm({
        title: '삭제 확인',
        message: '정말 삭제하시겠습니까?',
        onConfirm: () => {
          onDelete(menuItem.menuId || 0);
        },
      });
    }
  }, [menuItem, onDelete, showConfirm]);

  if (!menuItem && !isNew) {
    return null;
  }

  // 상위 메뉴 선택 옵션 (자기 자신은 제외)
  const parentOptions = allMenuItems.filter((item) => item.menuId !== menuItem?.menuId);

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
            value={formData.menuCode || ''}
            onChange={(e) => handleChange('menuCode', e.target.value)}
            placeholder="메뉴 코드를 입력하세요"
            disabled={!isNew || disabled}
            error={!!errors.menuCode}
            helperText={errors.menuCode}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            메뉴명 *
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.menuName || ''}
            onChange={(e) => handleChange('menuName', e.target.value)}
            placeholder="메뉴명을 입력하세요"
            disabled={disabled}
            error={!!errors.menuName}
            helperText={errors.menuName}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            라우트 경로
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={formData.menuPath || ''}
            onChange={(e) => handleChange('menuPath', e.target.value)}
            placeholder="/management/menu"
            disabled={disabled}
            error={!!errors.menuPath}
            helperText={errors.menuPath}
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
            value={formData.sortOrder ?? 1}
            onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 1)}
            disabled={disabled}
            inputProps={{ min: 1 }}
            error={!!errors.sortOrder}
            helperText={errors.sortOrder}
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
            value={formData.parentMenuCode || ''}
            onChange={(e) => handleChange('parentMenuCode', e.target.value || null)}
            disabled={disabled}
            error={!!errors.parentMenuCode}
            helperText={errors.parentMenuCode}
          >
            <MenuItem value="">
              <em>없음 (최상위)</em>
            </MenuItem>
            {parentOptions.map((option) => (
              <MenuItem key={option.menuId} value={option.menuCode}>
                {option.menuName} ({option.menuCode})
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
            value={formData.isActive ? 1 : 0}
            onChange={(e) => handleChange('isActive', e.target.value)}
            disabled={isNew || disabled}
            error={!!errors.isActive}
            helperText={isNew ? '화면 추가 후 표시로 변경' : errors.isActive}
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
