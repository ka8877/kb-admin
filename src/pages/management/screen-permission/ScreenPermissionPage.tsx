// 화면 권한 관리 메인 페이지

import React, { useState, useCallback, useMemo } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '@/components/common/PageHeader';
import Section from '@/components/layout/Section';
import MediumButton from '@/components/common/button/MediumButton';
import InlineSpinner from '@/components/common/spinner/InlineSpinner';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAuthStore } from '@/store/auth';
import { ALERT_TITLES } from '@/constants/message';
import { MenuTree } from './components/MenuTree';
import { permissionColumns } from './columns';
import { usePermissions, useMenuTree, useRoleMenuAccess, useSaveRoleMenuAccess } from './hooks';
import type { Permission, PermissionDisplay } from './types';

const ScreenPermissionPage: React.FC = () => {
  const { showAlert } = useAlertDialog();
  const user = useAuthStore((s) => s.user);

  const { data: permissions = [], isLoading: isPermissionsLoading } = usePermissions();
  const { data: menuTree = [], isLoading: isMenuTreeLoading } = useMenuTree();

  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedMenuCodes, setSelectedMenuCodes] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const { data: roleMenuAccess, isLoading: isRoleMenuAccessLoading } = useRoleMenuAccess(
    selectedPermission?.permission_code || null
  );

  const saveMenuAccessMutation = useSaveRoleMenuAccess();

  // 권한 목록 표시용 데이터
  const permissionRows: PermissionDisplay[] = useMemo(() => {
    return permissions.map((permission, index) => ({
      ...permission,
      no: index + 1,
    }));
  }, [permissions]);

  // 메뉴 접근 정보 로드 시 선택된 메뉴 초기화
  React.useEffect(() => {
    if (roleMenuAccess?.menus) {
      const grantedMenuCodes = new Set(
        roleMenuAccess.menus.filter((m) => m.granted).map((m) => m.menuCode)
      );
      setSelectedMenuCodes(grantedMenuCodes);
      setHasChanges(false);
    } else if (selectedPermission) {
      setSelectedMenuCodes(new Set());
      setHasChanges(false);
    }
  }, [roleMenuAccess, selectedPermission]);

  const handlePermissionSelect = useCallback((params: { row: PermissionDisplay }) => {
    setSelectedPermission(params.row);
  }, []);

  const handleMenuToggle = useCallback((menuCode: string, checked: boolean) => {
    setSelectedMenuCodes((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(menuCode);
      } else {
        newSet.delete(menuCode);
      }
      return newSet;
    });
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedPermission) return;

    try {
      const menuCodes = Array.from(selectedMenuCodes);

      await saveMenuAccessMutation.mutateAsync({
        roleCode: selectedPermission.permission_code,
        menuCodes,
        accessMode: 'READ',
      });

      setHasChanges(false);

      // 현재 사용자가 변경한 권한이면 메뉴 즉시 리프레시
      const userRoleUpper = String(user?.role || '').toUpperCase();
      const permCodeUpper = String(selectedPermission.permission_code || '').toUpperCase();

      const windowWithRefresh = window as Window & { refreshMenuPermissions?: () => void };
      if (userRoleUpper === permCodeUpper && windowWithRefresh.refreshMenuPermissions) {
        windowWithRefresh.refreshMenuPermissions();
      }

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
  }, [selectedPermission, selectedMenuCodes, saveMenuAccessMutation, showAlert, user?.role]);

  const handleCancel = useCallback(() => {
    if (roleMenuAccess?.menus) {
      const grantedMenuCodes = new Set(
        roleMenuAccess.menus.filter((m) => m.granted).map((m) => m.menuCode)
      );
      setSelectedMenuCodes(grantedMenuCodes);
    } else {
      setSelectedMenuCodes(new Set());
    }
    setHasChanges(false);
  }, [roleMenuAccess]);

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <PageHeader title="화면 권한 관리" />

      <Stack direction="row" spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* 좌측: 권한 목록 */}
        <Section sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            권한 목록
          </Typography>
          <Box sx={{ flex: '0 0 auto', height: 480, overflow: 'hidden' }}>
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
              autoHeight={false}
              rowHeight={40}
              columnHeaderHeight={44}
              sx={{ height: '100%' }}
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
                  disabled={!hasChanges || saveMenuAccessMutation.isPending}
                  subType="etc"
                >
                  취소
                </MediumButton>
                <MediumButton
                  variant="contained"
                  onClick={handleSave}
                  disabled={!hasChanges || saveMenuAccessMutation.isPending}
                  subType="u"
                >
                  저장
                </MediumButton>
              </Stack>
            )}
          </Stack>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {selectedPermission ? (
              isMenuTreeLoading || isRoleMenuAccessLoading ? (
                <InlineSpinner />
              ) : (
                <MenuTree
                  menus={menuTree}
                  selectedMenuCodes={selectedMenuCodes}
                  onMenuToggle={handleMenuToggle}
                  disabled={saveMenuAccessMutation.isPending}
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
};

export default ScreenPermissionPage;
