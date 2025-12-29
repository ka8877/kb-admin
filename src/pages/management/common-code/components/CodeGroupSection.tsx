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

const CodeGroupSection: React.FC<CodeGroupSectionProps> = ({ onGroupSelect, selectedGroup }) => {
  const { showAlert } = useAlertDialog();

  // 코드그룹 (대분류) State & Hooks
  const { data: codeGroups = [], isLoading: isGroupLoading } = useCodeGroups();
  const createGroupMutation = useCreateCodeGroup();
  const updateGroupMutation = useUpdateCodeGroup();
  const deleteGroupMutation = useDeleteCodeGroup();
  const deleteItemsMutation = useDeleteCodeItems();

  const { data: codeItems = [] } = useCodeItems(
    selectedGroup ? { groupCode: selectedGroup.groupCode } : undefined
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
    [onGroupSelect]
  );

  const handleAddGroup = useCallback(() => {
    onGroupSelect(null);
    setIsNewGroup(true);
    setIsGroupFormOpen(true);
  }, [onGroupSelect]);

  const checkGroupCodeDuplicate = useCallback(
    (groupCode: string) => {
      return codeGroups.some((item) => item.groupCode === groupCode);
    },
    [codeGroups]
  );

  const handleSaveGroup = useCallback(
    async (data: Omit<CodeGroup, 'codeGroupId'>) => {
      try {
        if (isNewGroup) {
          if (checkGroupCodeDuplicate(data.groupCode)) {
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
            groupCode: selectedGroup.groupCode,
            data: { groupName: data.groupName },
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
    ]
  );

  const handleDeleteGroup = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      if (codeItems.length > 0) {
        const codeItemIds = codeItems.map((item) => item.codeItemId);
        await deleteItemsMutation.mutateAsync(codeItemIds);
      }

      await deleteGroupMutation.mutateAsync(selectedGroup.groupCode);

      onGroupSelect(null);
      setIsGroupFormOpen(false);
      showAlert({
        title: ALERT_TITLES.SUCCESS,
        message: getCodeGroupDeleteSuccessMessage(codeItems.length),
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
  }, [
    selectedGroup,
    codeItems,
    deleteItemsMutation,
    deleteGroupMutation,
    showAlert,
    onGroupSelect,
  ]);

  const handleCancelForm = useCallback(() => {
    setIsGroupFormOpen(false);
    onGroupSelect(null);
  }, [onGroupSelect]);

  return (
    <>
      <Section>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <h2 style={{ fontSize: '1.2rem' }}>코드그룹 (대분류)</h2>
          <MediumButton variant="contained" onClick={handleAddGroup} subType="c">
            추가
          </MediumButton>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <EditableList
            columns={codeGroupColumns}
            rows={codeGroups}
            isLoading={isGroupLoading}
            onRowClick={handleGroupRowClick}
            rowIdGetter={(row) => row.codeGroupId || 0}
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
};

export default CodeGroupSection;
