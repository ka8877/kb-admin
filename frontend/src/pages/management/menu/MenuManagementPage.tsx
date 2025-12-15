// frontend/src/pages/management/menu/MenuManagementPage.tsx
import React, { useCallback, useMemo, useState } from 'react';
import EditableList from '@/components/common/list/EditableList';
import ManagementListDetailLayout from '@/components/layout/list/ManagementListDetailLayout';
import MenuForm from './components/MenuForm';
import { menuColumns } from './components/columns';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu } from './hooks';
import type { MenuItem, MenuItemDisplay } from './types';

// 상수
const MESSAGES = {
  CREATE_SUCCESS: '메뉴가 추가되었습니다.',
  UPDATE_SUCCESS: '메뉴가 수정되었습니다.',
  DELETE_SUCCESS: '메뉴가 삭제되었습니다.',
  SAVE_ERROR: '저장 중 오류가 발생했습니다.',
  DELETE_ERROR: '삭제 중 오류가 발생했습니다.',
  EMPTY_STATE: '메뉴를 선택하거나 추가 버튼을 클릭하세요',
} as const;

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const MenuManagementPage: React.FC = () => {
  const { showAlert } = useAlertDialog();
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);

  const { data: menus = [], isLoading } = useMenus();
  const createMenuMutation = useCreateMenu();
  const updateMenuMutation = useUpdateMenu();
  const deleteMenuMutation = useDeleteMenu();

  // MenuItem[]을 MenuItemDisplay[]로 변환
  const allMenus = useMemo(() => {
    return menus.map((item, index) => ({
      ...item,
      no: index + 1,
      id: item.firebaseKey,
    })) as MenuItemDisplay[];
  }, [menus]);

  const handleRowClick = useCallback((params: { id: string | number; row: MenuItemDisplay }) => {
    const menuItem = params.row as MenuItem;
    setSelectedMenu(menuItem);
    setIsNewMode(false);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedMenu(null);
    setIsNewMode(true);
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedMenu(null);
    setIsNewMode(false);
  }, []);

  const handleSave = useCallback(
    async (menuItem: MenuItem) => {
      try {
        if (isNewMode) {
          await createMenuMutation.mutateAsync({
            menu_code: menuItem.menu_code,
            menu_name: menuItem.menu_name,
            menu_path: menuItem.menu_path || null,
            parent_menu_code: menuItem.parent_menu_code || null,
            sort_order: menuItem.sort_order || 1,
            is_active: menuItem.is_active,
            created_by: 1,
          });
          showAlert({
            title: '완료',
            message: MESSAGES.CREATE_SUCCESS,
            severity: 'success',
          });
        } else {
          await updateMenuMutation.mutateAsync({
            firebaseKey: String(menuItem.firebaseKey),
            updates: {
              menu_name: menuItem.menu_name,
              menu_path: menuItem.menu_path || null,
              parent_menu_code: menuItem.parent_menu_code || null,
              sort_order: menuItem.sort_order || 1,
              is_active: menuItem.is_active,
            },
          });
          showAlert({
            title: '완료',
            message: MESSAGES.UPDATE_SUCCESS,
            severity: 'success',
          });
        }

        setSelectedMenu(null);
        setIsNewMode(false);
      } catch (error) {
        console.error('Save error:', error);
        showAlert({
          title: '오류',
          message: MESSAGES.SAVE_ERROR,
          severity: 'error',
        });
      }
    },
    [isNewMode, createMenuMutation, updateMenuMutation, showAlert],
  );

  const handleDelete = useCallback(
    async (id: string | number) => {
      try {
        await deleteMenuMutation.mutateAsync(String(id));
        showAlert({
          title: '완료',
          message: MESSAGES.DELETE_SUCCESS,
          severity: 'success',
        });
        setSelectedMenu(null);
        setIsNewMode(false);
      } catch (error) {
        console.error('Delete error:', error);
        showAlert({
          title: '오류',
          message: MESSAGES.DELETE_ERROR,
          severity: 'error',
        });
      }
    },
    [deleteMenuMutation, showAlert],
  );

  return (
    <ManagementListDetailLayout
      title="메뉴 관리"
      onAddNew={handleAddNew}
      disabled={
        isLoading ||
        createMenuMutation.isPending ||
        updateMenuMutation.isPending ||
        deleteMenuMutation.isPending
      }
      showDetail={!!(selectedMenu || isNewMode)}
      emptyStateText={MESSAGES.EMPTY_STATE}
      gridRatio={{ left: 8, right: 4 }}
      listNode={
        <EditableList<MenuItemDisplay>
          rows={allMenus}
          columns={menuColumns}
          rowIdGetter={(r: MenuItemDisplay) => r.firebaseKey || r.id || ''}
          defaultPageSize={DEFAULT_PAGE_SIZE}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onRowClick={handleRowClick}
          isEditMode={false}
          autoHeight={true}
          isLoading={isLoading}
        />
      }
      detailNode={
        <MenuForm
          menuItem={selectedMenu}
          allMenuItems={allMenus as MenuItem[]}
          isNew={isNewMode}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
          disabled={
            createMenuMutation.isPending ||
            updateMenuMutation.isPending ||
            deleteMenuMutation.isPending
          }
        />
      }
    />
  );
};

export default MenuManagementPage;
