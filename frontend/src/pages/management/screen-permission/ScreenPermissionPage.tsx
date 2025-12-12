// 화면 권한 관리 메인 페이지

import React, { useState, useCallback, useMemo } from 'react';
import { Stack, Box, Paper, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '@/components/common/PageHeader';
import Section from '@/components/layout/Section';
import MediumButton from '@/components/common/button/MediumButton';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { ALERT_TITLES } from '@/constants/message';
import { MenuTree } from './components/MenuTree';
import { permissionColumns } from './columns';
import {
  usePermissions,
  useMenuTree,
  useScreenPermissions,
  useSaveScreenPermissions,
} from './hooks';
import type { Permission, PermissionDisplay, ScreenPermissionInput } from './types';

export default function ScreenPermissionPage() {
  const { showAlert } = useAlertDialog();

  const { data: permissions = [], isLoading: isPermissionsLoading } = usePermissions();
  const { data: menuTree = [], isLoading: isMenuTreeLoading } = useMenuTree();

  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string | number>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const { data: screenPermissions = [], isLoading: isScreenPermissionsLoading } =
    useScreenPermissions(selectedPermission?.permission_id || null);

  const savePermissionsMutation = useSaveScreenPermissions();

  // 권한 목록 표시용 데이터
  const permissionRows: PermissionDisplay[] = useMemo(() => {
    return permissions.map((permission, index) => ({
      ...permission,
      no: index + 1,
    }));
  }, [permissions]);

  // 화면 권한 로드 시 선택된 메뉴 초기화
  React.useEffect(() => {
    if (screenPermissions.length > 0) {
      const menuIds = new Set(screenPermissions.map((sp) => sp.menu_id));
      setSelectedMenuIds(menuIds);
      setHasChanges(false);
    } else if (selectedPermission) {
      setSelectedMenuIds(new Set());
      setHasChanges(false);
    }
  }, [screenPermissions, selectedPermission]);

  const handlePermissionSelect = useCallback((params: { row: PermissionDisplay }) => {
    setSelectedPermission(params.row);
  }, []);

  const handleMenuToggle = useCallback((menuId: string | number, checked: boolean) => {
    setSelectedMenuIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(menuId);
      } else {
        newSet.delete(menuId);
      }
      return newSet;
    });
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedPermission) return;

    try {
      const permissions: ScreenPermissionInput[] = Array.from(selectedMenuIds).map((menuId) => ({
        menu_id: menuId,
      }));

      await savePermissionsMutation.mutateAsync({
        permissionId: selectedPermission.permission_id,
        permissions,
      });

      setHasChanges(false);
      showAlert({
        title: ALERT_TITLES.SUCCESS,
        message: '화면 권한이 저장되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to save screen permissions:', error);
      showAlert({
        title: ALERT_TITLES.ERROR,
        message: '화면 권한 저장에 실패했습니다.',
        severity: 'error',
      });
    }
  }, [selectedPermission, selectedMenuIds, savePermissionsMutation, showAlert]);

  const handleCancel = useCallback(() => {
    if (screenPermissions.length > 0) {
      const menuIds = new Set(screenPermissions.map((sp) => sp.menu_id));
      setSelectedMenuIds(menuIds);
    } else {
      setSelectedMenuIds(new Set());
    }
    setHasChanges(false);
  }, [screenPermissions]);

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <PageHeader title="화면 권한 관리" />

      <Stack direction="row" spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* 좌측: 권한 목록 */}
        <Section sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            권한 목록
          </Typography>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <DataGrid
              rows={permissionRows}
              columns={permissionColumns}
              loading={isPermissionsLoading}
              getRowId={(row) => row.permission_id}
              onRowClick={handlePermissionSelect}
              disableRowSelectionOnClick
              pageSizeOptions={[20, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 20 } },
              }}
            />
          </Box>
        </Section>

        {/* 우측: 메뉴 트리 */}
        <Section sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {selectedPermission
                ? `${selectedPermission.permission_name}의 화면 목록`
                : '메뉴 선택'}
            </Typography>
            {selectedPermission && (
              <Stack direction="row" spacing={1}>
                <MediumButton
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={!hasChanges || savePermissionsMutation.isPending}
                >
                  취소
                </MediumButton>
                <MediumButton
                  variant="contained"
                  onClick={handleSave}
                  disabled={!hasChanges || savePermissionsMutation.isPending}
                >
                  저장
                </MediumButton>
              </Stack>
            )}
          </Stack>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {selectedPermission ? (
              isMenuTreeLoading || isScreenPermissionsLoading ? (
                <Typography variant="body2" color="text.secondary">
                  로딩 중...
                </Typography>
              ) : (
                <MenuTree
                  menus={menuTree}
                  selectedMenuIds={selectedMenuIds}
                  onMenuToggle={handleMenuToggle}
                  disabled={savePermissionsMutation.isPending}
                />
              )
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.secondary',
                }}
              >
                <Typography variant="body2">좌측에서 권한을 선택해주세요</Typography>
              </Box>
            )}
          </Box>
        </Section>
      </Stack>
    </Stack>
  );
}
