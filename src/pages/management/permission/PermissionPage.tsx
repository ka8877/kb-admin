import React, { useCallback, useEffect, useState } from 'react';
import EditableList from '@/components/common/list/EditableList';
import ManagementListDetailLayout from '@/components/layout/list/ManagementListDetailLayout';
import PermissionForm from './components/PermissionForm';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import type { PermissionItem, RowItem } from './types';
import { listColumns } from './components/columns';
import { fetchPermissions, createPermission, updatePermission, deletePermission } from './api';

// 상수
const MESSAGES = {
  DUPLICATE_ID: '이미 존재하는 권한 ID입니다.',
  CREATE_SUCCESS: '권한이 추가되었습니다.',
  UPDATE_SUCCESS: '권한이 수정되었습니다.',
  DELETE_SUCCESS: '권한이 삭제되었습니다.',
  SAVE_ERROR: '저장에 실패했습니다.',
  DELETE_ERROR: '삭제에 실패했습니다.',
  EMPTY_STATE: '권한을 선택하거나 추가 버튼을 클릭하세요',
} as const;

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const PermissionPage: React.FC = () => {
  const { showAlert } = useAlertDialog();
  const [selectedPermission, setSelectedPermission] = useState<PermissionItem | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allPermissions, setAllPermissions] = useState<RowItem[]>([]);

  const loadAllPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPermissions();
      const permissionData = data.map((item, index) => ({
        ...item,
        no: index + 1,
      }));
      setAllPermissions(permissionData);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllPermissions();
  }, [loadAllPermissions, refreshKey]);

  const handleRowClick = useCallback((params: { id: string | number; row: RowItem }) => {
    setSelectedPermission(params.row);
    setIsNewMode(false);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedPermission(null);
    setIsNewMode(true);
  }, []);

  const handleSave = useCallback(
    async (permission: PermissionItem) => {
      setLoading(true);
      try {
        // 중복 체크 (state 사용)
        const isDuplicate = allPermissions.some(
          (p) => p.permission_id === permission.permission_id && p.id !== permission.id,
        );

        if (isDuplicate) {
          showAlert({
            title: '알림',
            message: MESSAGES.DUPLICATE_ID,
            severity: 'warning',
          });
          return;
        }

        if (isNewMode) {
          await createPermission({
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            status: permission.status,
          });
          showAlert({
            title: '완료',
            message: MESSAGES.CREATE_SUCCESS,
            severity: 'success',
          });
        } else {
          await updatePermission(permission.id, {
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            status: permission.status,
            created_at: permission.created_at,
          });
          showAlert({
            title: '완료',
            message: MESSAGES.UPDATE_SUCCESS,
            severity: 'success',
          });
        }

        setSelectedPermission(null);
        setIsNewMode(false);
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error('Failed to save permission:', error);
        showAlert({
          title: '오류',
          message: MESSAGES.SAVE_ERROR,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [isNewMode, allPermissions, showAlert],
  );

  const handleCancel = useCallback(() => {
    setSelectedPermission(null);
    setIsNewMode(false);
  }, []);

  const handleDelete = useCallback(
    async (id: string | number) => {
      setLoading(true);
      try {
        await deletePermission(id);
        setSelectedPermission(null);
        setIsNewMode(false);
        showAlert({
          title: '완료',
          message: MESSAGES.DELETE_SUCCESS,
          severity: 'success',
        });
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error('Failed to delete permission:', error);
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
      title="권한 관리"
      onAddNew={handleAddNew}
      disabled={loading}
      showDetail={!!(selectedPermission || isNewMode)}
      emptyStateText={MESSAGES.EMPTY_STATE}
      listNode={
        <EditableList
          rows={allPermissions}
          columns={listColumns}
          rowIdGetter={(r: RowItem) => r.id}
          defaultPageSize={DEFAULT_PAGE_SIZE}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onRowClick={handleRowClick}
          isEditMode={false}
          isLoading={loading}
        />
      }
      detailNode={
        <PermissionForm
          permission={selectedPermission}
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

export default PermissionPage;
