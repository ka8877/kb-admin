import React, { useCallback, useState } from 'react';
import { Box, Grid, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import MediumButton from '@/components/common/button/MediumButton';
import Section from '@/components/layout/Section';
import EditableList from '@/components/common/list/EditableList';
import PermissionForm from './components/PermissionForm';
import { permissionMockDb } from '@/mocks/permissionDb';
import type { PermissionItem, RowItem } from './types';
import { listColumns } from './components/columns';

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
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const PermissionPage: React.FC = () => {
  const [selectedPermission, setSelectedPermission] = useState<PermissionItem | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
        const allPermissions = await permissionMockDb.listAll();
        const isDuplicate = allPermissions.some(
          (p) => p.permission_id === permission.permission_id && p.id !== permission.id,
        );

        if (isDuplicate) {
          alert(MESSAGES.DUPLICATE_ID);
          return;
        }

        if (isNewMode) {
          await permissionMockDb.create({
            permission_id: permission.permission_id,
            permission_name: permission.permission_name,
            status: permission.status,
          });
          alert(MESSAGES.CREATE_SUCCESS);
        } else {
          await permissionMockDb.update(permission.id, {
            permission_name: permission.permission_name,
            status: permission.status,
          });
          alert(MESSAGES.UPDATE_SUCCESS);
        }

        setSelectedPermission(null);
        setIsNewMode(false);
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error('Failed to save permission:', error);
        alert(MESSAGES.SAVE_ERROR);
      } finally {
        setLoading(false);
      }
    },
    [isNewMode],
  );

  const handleCancel = useCallback(() => {
    setSelectedPermission(null);
    setIsNewMode(false);
  }, []);

  const handleDelete = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      await permissionMockDb.delete(id);
      setSelectedPermission(null);
      setIsNewMode(false);
      alert(MESSAGES.DELETE_SUCCESS);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to delete permission:', error);
      alert(MESSAGES.DELETE_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Box>
      <PageHeader title="권한 관리" />
      <Section>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <MediumButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            disabled={loading}
          >
            추가
          </MediumButton>
        </Box>
        <Grid container spacing={2}>
          {/* 좌측: 리스트 */}
          <Grid item xs={12} md={7}>
            <EditableList
              key={refreshKey}
              columns={listColumns}
              fetcher={async () => {
                const data = await permissionMockDb.listAll();
                return data.map((item, index) => ({
                  ...item,
                  no: index + 1,
                }));
              }}
              rowIdGetter={(r: RowItem) => r.id}
              defaultPageSize={DEFAULT_PAGE_SIZE}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onRowClick={handleRowClick}
              isEditMode={false}
            />
          </Grid>

          {/* 우측: 상세 폼 */}
          <Grid item xs={12} md={5}>
            {(selectedPermission || isNewMode) && (
              <PermissionForm
                permission={selectedPermission}
                isNew={isNewMode}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
                disabled={loading}
              />
            )}
            {!selectedPermission && !isNewMode && (
              <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                {MESSAGES.EMPTY_STATE}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Section>
    </Box>
  );
};

export default PermissionPage;
