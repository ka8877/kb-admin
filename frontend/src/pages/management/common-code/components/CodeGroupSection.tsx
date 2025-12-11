import React, { useState, useCallback } from 'react';
import { Stack, Box } from '@mui/material';
import EditableList from '@/components/common/list/EditableList';
import MediumButton from '@/components/common/button/MediumButton';
import CodeGroupForm from './CodeGroupForm';
import { codeGroupColumns } from './columns';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import {
  ALERT_TITLES,
  ALERT_MESSAGES,
  TOAST_MESSAGES,
  getCodeGroupDeleteSuccessMessage,
} from '@/constants/message';
import type { CodeGroup, CodeGroupDisplay } from '../types';
import {
  useCodeGroups,
  useCreateCodeGroup,
  useUpdateCodeGroup,
  useDeleteCodeGroup,
  useDeleteCodeItems,
  useCodeItems,
} from '../hooks';
import Section from '@/components/layout/Section';

interface CodeGroupSectionProps {
  onGroupSelect: (group: CodeGroupDisplay | null) => void;
  selectedGroup: CodeGroupDisplay | null;
}

export default function CodeGroupSection({ onGroupSelect, selectedGroup }: CodeGroupSectionProps) {
  const { showAlert } = useAlertDialog();

  // 코드그룹 (대분류) State & Hooks
  const { data: codeGroups = [], isLoading: isGroupLoading } = useCodeGroups();
  const createGroupMutation = useCreateCodeGroup();
  const updateGroupMutation = useUpdateCodeGroup();
  const deleteGroupMutation = useDeleteCodeGroup();
  const deleteItemsMutation = useDeleteCodeItems();

  const { data: codeItems = [] } = useCodeItems(
    selectedGroup ? { codeGroupId: selectedGroup.code_group_id } : undefined,
  );

  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);

  const handleGroupRowClick = useCallback(
    (params: { id: string | number; row: CodeGroupDisplay }) => {
      const group = params.row;
      onGroupSelect(group);
      setIsGroupFormOpen(true);
      setIsNewGroup(false);
    },
    [onGroupSelect],
  );

  const handleAddGroup = useCallback(() => {
    onGroupSelect(null);
    setIsNewGroup(true);
    setIsGroupFormOpen(true);
  }, [onGroupSelect]);

  const checkGroupCodeDuplicate = useCallback(
    (groupCode: string) => {
      return codeGroups.some((item) => item.group_code === groupCode);
    },
    [codeGroups],
  );

  const handleSaveGroup = useCallback(
    async (
      data: Omit<
        CodeGroup,
        'code_group_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at'
      >,
    ) => {
      try {
        if (isNewGroup) {
          if (checkGroupCodeDuplicate(data.group_code)) {
            showAlert({
              title: ALERT_TITLES.NOTIFICATION,
              message: ALERT_MESSAGES.GROUP_CODE_ALREADY_EXISTS,
              severity: 'warning',
            });
            return;
          }
          await createGroupMutation.mutateAsync(data);
          showAlert({
            title: ALERT_TITLES.SUCCESS,
            message: TOAST_MESSAGES.CODE_GROUP_CREATED,
            severity: 'success',
          });
        } else if (selectedGroup) {
          await updateGroupMutation.mutateAsync({
            codeGroupId: selectedGroup.code_group_id,
            data,
            firebaseKey: selectedGroup.firebaseKey,
          });
          showAlert({
            title: ALERT_TITLES.SUCCESS,
            message: TOAST_MESSAGES.CODE_GROUP_UPDATED,
            severity: 'success',
          });
        }
        setIsGroupFormOpen(false);
        setIsNewGroup(false);
      } catch (error) {
        console.error('Failed to save code group:', error);
        showAlert({
          title: ALERT_TITLES.ERROR,
          message: TOAST_MESSAGES.CODE_GROUP_SAVE_FAILED,
          severity: 'error',
        });
      }
    },
    [
      isNewGroup,
      selectedGroup,
      checkGroupCodeDuplicate,
      createGroupMutation,
      updateGroupMutation,
      showAlert,
    ],
  );

  const handleDeleteGroup = useCallback(
    async (codeGroupId: number) => {
      if (!selectedGroup) return;

      try {
        const relatedItems = codeItems.filter(
          (item) => item.code_group_id === selectedGroup.code_group_id,
        );

        if (relatedItems.length > 0) {
          const itemsToDelete = relatedItems.map((item) => ({
            codeItemId: item.code_item_id,
            firebaseKey: item.firebaseKey,
          }));
          await deleteItemsMutation.mutateAsync(itemsToDelete);
        }

        await deleteGroupMutation.mutateAsync({
          codeGroupId,
          firebaseKey: selectedGroup.firebaseKey,
        });

        onGroupSelect(null);
        setIsGroupFormOpen(false);
        showAlert({
          title: ALERT_TITLES.SUCCESS,
          message: getCodeGroupDeleteSuccessMessage(relatedItems.length),
          severity: 'success',
        });
      } catch (error) {
        console.error('Failed to delete code group:', error);
        showAlert({
          title: ALERT_TITLES.ERROR,
          message: TOAST_MESSAGES.CODE_GROUP_DELETE_FAILED,
          severity: 'error',
        });
      }
    },
    [selectedGroup, codeItems, deleteItemsMutation, deleteGroupMutation, showAlert, onGroupSelect],
  );

  const handleCancelForm = useCallback(() => {
    setIsGroupFormOpen(false);
    onGroupSelect(null);
  }, [onGroupSelect]);

  return (
    <>
      <Section>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <h2 style={{ fontSize: '1.2rem' }}>코드그룹 (대분류)</h2>
          <MediumButton variant="contained" onClick={handleAddGroup}>
            추가
          </MediumButton>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <EditableList
            columns={codeGroupColumns}
            rows={codeGroups}
            isLoading={isGroupLoading}
            onRowClick={handleGroupRowClick}
            rowIdGetter={(row) => row.code_group_id || 0}
            autoHeight={false}
          />
        </Box>
      </Section>

      {isGroupFormOpen && (
        <Box sx={{ mt: 2 }}>
          <CodeGroupForm
            selectedItem={isNewGroup ? null : (selectedGroup as CodeGroup | null)}
            isNew={isNewGroup}
            onSave={handleSaveGroup}
            onCancel={handleCancelForm}
            onDelete={handleDeleteGroup}
          />
        </Box>
      )}
    </>
  );
}
