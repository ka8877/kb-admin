// frontend/src/pages/management/menu/MenuManagementPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { menuMockDb } from '@/mocks/menuDb';
import EditableList from '@/components/common/list/EditableList';
import ManagementListDetailLayout from '@/components/layout/list/ManagementListDetailLayout';
import MenuForm from './components/MenuForm';
import { menuColumns } from './components/columns';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import type { MenuScreenItem, RowItem } from './types';

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
  const [selectedMenu, setSelectedMenu] = useState<MenuScreenItem | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allMenus, setAllMenus] = useState<RowItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAllMenus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await menuMockDb.listAll();
      const menuData = data.map((item, index) => ({
        ...item,
        no: index + 1,
      }));
      setAllMenus(menuData);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllMenus();
  }, [loadAllMenus, refreshKey]);

  const handleRowClick = useCallback((params: { id: string | number; row: RowItem }) => {
    setSelectedMenu(params.row);
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
    async (menuItem: MenuScreenItem) => {
      setLoading(true);
      try {
        if (isNewMode) {
          await menuMockDb.create({
            screen_id: menuItem.screen_id,
            screen_name: menuItem.screen_name,
            path: menuItem.path,
            depth: menuItem.depth,
            order: menuItem.order,
            parent_screen_id: menuItem.parent_screen_id,
            screen_type: menuItem.screen_type,
            display_yn: menuItem.display_yn,
          });
          showAlert({
            title: '완료',
            message: MESSAGES.CREATE_SUCCESS,
            severity: 'success',
          });
        } else {
          await menuMockDb.update(menuItem.id, {
            screen_name: menuItem.screen_name,
            path: menuItem.path,
            depth: menuItem.depth,
            order: menuItem.order,
            parent_screen_id: menuItem.parent_screen_id,
            screen_type: menuItem.screen_type,
            display_yn: menuItem.display_yn,
          });
          showAlert({
            title: '완료',
            message: MESSAGES.UPDATE_SUCCESS,
            severity: 'success',
          });
        }

        setSelectedMenu(null);
        setIsNewMode(false);
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error('Save error:', error);
        showAlert({
          title: '오류',
          message: MESSAGES.SAVE_ERROR,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [isNewMode],
  );

  const handleDelete = useCallback(
    async (id: string | number) => {
      setLoading(true);
      try {
        await menuMockDb.delete(id);
        showAlert({
          title: '완료',
          message: MESSAGES.DELETE_SUCCESS,
          severity: 'success',
        });
        setSelectedMenu(null);
        setIsNewMode(false);
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error('Delete error:', error);
        showAlert({
          title: '오류',
          message: MESSAGES.DELETE_ERROR,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [showAlert],
  );

  return (
    <ManagementListDetailLayout
      title="메뉴 관리"
      onAddNew={handleAddNew}
      disabled={loading}
      showDetail={!!(selectedMenu || isNewMode)}
      emptyStateText={MESSAGES.EMPTY_STATE}
      gridRatio={{ left: 8, right: 4 }}
      listNode={
        <EditableList
          rows={allMenus}
          columns={menuColumns}
          rowIdGetter={(r: RowItem) => r.id}
          defaultPageSize={DEFAULT_PAGE_SIZE}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onRowClick={handleRowClick}
          isEditMode={false}
          autoHeight={true}
          isLoading={loading}
        />
      }
      detailNode={
        <MenuForm
          menuItem={selectedMenu}
          allMenuItems={allMenus}
          isNew={isNewMode}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
          disabled={loading}
        />
      }
    />
  );
};

export default MenuManagementPage;
