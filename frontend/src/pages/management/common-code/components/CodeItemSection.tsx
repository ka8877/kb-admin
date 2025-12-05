import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Box } from '@mui/material';
import SortableList from '@/components/common/list/SortableList';
import MediumButton from '@/components/common/button/MediumButton';
import CodeItemForm from './CodeItemForm';
import Section from '@/components/layout/Section';
import { codeItemColumns } from './columns';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import {
  ALERT_TITLES,
  ALERT_MESSAGES,
  TOAST_MESSAGES,
  CONFIRM_TITLES,
  CONFIRM_MESSAGES,
  getCodeItemDeleteSuccessMessage,
} from '@/constants/message';
import type { CodeItem, CodeItemDisplay, CodeGroupDisplay } from '../types';
import {
  useCodeItems,
  useCreateCodeItem,
  useUpdateCodeItem,
  useDeleteCodeItem,
  useDeleteCodeItems,
} from '../hooks';

interface CodeItemSectionProps {
  selectedGroup: CodeGroupDisplay | null;
}

export default function CodeItemSection({ selectedGroup }: CodeItemSectionProps) {
  const { showAlert } = useAlertDialog();

  // 코드아이템 (소분류) State & Hooks
  const {
    data: codeItems = [],
    isLoading: isItemLoading,
    refetch: refetchCodeItems,
  } = useCodeItems(selectedGroup ? { codeGroupId: selectedGroup.code_group_id } : undefined);
  const createItemMutation = useCreateCodeItem();
  const updateItemMutation = useUpdateCodeItem();
  const deleteItemMutation = useDeleteCodeItem();
  const deleteItemsMutation = useDeleteCodeItems();

  const [selectedItem, setSelectedItem] = useState<CodeItemDisplay | null>(null);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const [isItemSortMode, setIsItemSortMode] = useState(false); // 순서 편집 모드
  const [isItemSelectionMode, setIsItemSelectionMode] = useState(false); // 선택 모드
  const [tempSortedItems, setTempSortedItems] = useState<CodeItemDisplay[]>([]); // 임시 순서 변경 데이터
  const [isSortChanged, setIsSortChanged] = useState(false); // 순서 변경 여부
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>([]); // 선택된 아이템 ID

  // selectedGroup이 변경될 때 코드아이템 자동 리프레시 및 상태 초기화
  useEffect(() => {
    if (selectedGroup) {
      refetchCodeItems();
    }
    // 그룹이 변경되거나 없어지면 모든 관련 상태 초기화
    setSelectedItem(null);
    setIsItemFormOpen(false);
    setIsNewItem(false);
    setIsItemSortMode(false);
    setIsItemSelectionMode(false);
    setTempSortedItems([]);
    setIsSortChanged(false);
    setSelectedItemIds([]);
  }, [selectedGroup, refetchCodeItems]);

  // 순서 편집 모드 진입 시 현재 데이터를 임시 저장
  useEffect(() => {
    if (isItemSortMode) {
      setTempSortedItems([...codeItems]);
      setIsSortChanged(false);
    }
  }, [isItemSortMode, codeItems]);

  // ========== 코드아이템 이벤트 핸들러 ==========

  const handleItemRowClick = useCallback(
    (params: { id: string | number; row: CodeItemDisplay }) => {
      const item = params.row;
      setSelectedItem(item);
      setIsItemFormOpen(true);
      setIsNewItem(false);
    },
    [],
  );

  const handleAddItem = useCallback(() => {
    if (!selectedGroup) {
      showAlert({
        title: ALERT_TITLES.NOTIFICATION,
        message: ALERT_MESSAGES.SELECT_CODE_GROUP_FIRST,
        severity: 'warning',
      });
      return;
    }
    setSelectedItem(null);
    setIsNewItem(true);
    setIsItemFormOpen(true);
  }, [selectedGroup, showAlert]);

  const checkItemCodeDuplicate = useCallback(
    (codeGroupId: number, code: string, excludeItemId?: number) => {
      return codeItems.some(
        (item) =>
          item.code_group_id === codeGroupId &&
          item.code === code &&
          (excludeItemId === undefined || item.code_item_id !== excludeItemId),
      );
    },
    [codeItems],
  );

  const checkItemNameDuplicate = useCallback(
    (codeGroupId: number, codeName: string, excludeItemId?: number) => {
      return codeItems.some(
        (item) =>
          item.code_group_id === codeGroupId &&
          item.code_name === codeName &&
          (excludeItemId === undefined || item.code_item_id !== excludeItemId),
      );
    },
    [codeItems],
  );

  const handleSaveItem = useCallback(
    async (
      data: Omit<
        CodeItem,
        'code_item_id' | 'created_by' | 'created_at' | 'updated_by' | 'updated_at'
      >,
    ) => {
      try {
        if (isNewItem) {
          if (checkItemCodeDuplicate(data.code_group_id, data.code)) {
            showAlert({
              title: ALERT_TITLES.NOTIFICATION,
              message: ALERT_MESSAGES.CODE_ALREADY_EXISTS,
              severity: 'warning',
            });
            return;
          }
          if (checkItemNameDuplicate(data.code_group_id, data.code_name)) {
            showAlert({
              title: ALERT_TITLES.NOTIFICATION,
              message: ALERT_MESSAGES.CODE_NAME_ALREADY_EXISTS,
              severity: 'warning',
            });
            return;
          }
          await createItemMutation.mutateAsync(data);
          showAlert({
            title: ALERT_TITLES.SUCCESS,
            message: TOAST_MESSAGES.CODE_ITEM_CREATED,
            severity: 'success',
          });
        } else if (selectedItem) {
          if (checkItemCodeDuplicate(data.code_group_id, data.code, selectedItem.code_item_id)) {
            showAlert({
              title: ALERT_TITLES.NOTIFICATION,
              message: ALERT_MESSAGES.CODE_ALREADY_EXISTS,
              severity: 'warning',
            });
            return;
          }
          if (
            checkItemNameDuplicate(data.code_group_id, data.code_name, selectedItem.code_item_id)
          ) {
            showAlert({
              title: ALERT_TITLES.NOTIFICATION,
              message: ALERT_MESSAGES.CODE_NAME_ALREADY_EXISTS,
              severity: 'warning',
            });
            return;
          }

          await updateItemMutation.mutateAsync({
            codeItemId: selectedItem.code_item_id,
            data: {
              ...data,
              firebaseKey: selectedItem.firebaseKey,
            },
          });
          showAlert({
            title: ALERT_TITLES.SUCCESS,
            message: TOAST_MESSAGES.CODE_ITEM_UPDATED,
            severity: 'success',
          });
        }
        setIsItemFormOpen(false);
        setIsNewItem(false);
      } catch (error) {
        console.error('Failed to save code item:', error);
        showAlert({
          title: ALERT_TITLES.ERROR,
          message: TOAST_MESSAGES.CODE_ITEM_SAVE_FAILED,
          severity: 'error',
        });
      }
    },
    [
      isNewItem,
      selectedItem,
      checkItemCodeDuplicate,
      checkItemNameDuplicate,
      createItemMutation,
      updateItemMutation,
      showAlert,
    ],
  );

  const handleDeleteItem = useCallback(
    async (codeItemId: number) => {
      try {
        const firebaseKey = selectedItem?.firebaseKey;
        await deleteItemMutation.mutateAsync({ codeItemId, firebaseKey });
        setSelectedItem(null);
        setIsItemFormOpen(false);
        showAlert({
          title: ALERT_TITLES.SUCCESS,
          message: TOAST_MESSAGES.CODE_ITEM_DELETED,
          severity: 'success',
        });
      } catch (error) {
        console.error('Failed to delete code item:', error);
        showAlert({
          title: ALERT_TITLES.ERROR,
          message: TOAST_MESSAGES.CODE_ITEM_DELETE_FAILED,
          severity: 'error',
        });
      }
    },
    [selectedItem, deleteItemMutation, showAlert],
  );

  const handleDeleteSelectedItems = useCallback(
    async (idsToDelete?: (string | number)[]) => {
      const ids = idsToDelete || selectedItemIds;

      if (ids.length === 0) {
        showAlert({
          title: ALERT_TITLES.NOTIFICATION,
          message: ALERT_MESSAGES.DELETE_ITEMS_SELECT,
          severity: 'warning',
        });
        return;
      }

      try {
        const itemsToDelete = codeItems
          .filter((item) => ids.includes(item.firebaseKey || item.code_item_id))
          .map((item) => ({
            codeItemId: item.code_item_id,
            firebaseKey: item.firebaseKey,
          }));

        await deleteItemsMutation.mutateAsync(itemsToDelete);
        setSelectedItemIds([]);
        setIsItemSelectionMode(false);
        showAlert({
          title: ALERT_TITLES.SUCCESS,
          message: getCodeItemDeleteSuccessMessage(itemsToDelete.length),
          severity: 'success',
        });
      } catch (error) {
        console.error('Failed to delete code items:', error);
        showAlert({
          title: ALERT_TITLES.ERROR,
          message: TOAST_MESSAGES.CODE_ITEM_DELETE_FAILED,
          severity: 'error',
        });
      }
    },
    [selectedItemIds, codeItems, deleteItemsMutation, showAlert],
  );

  const handleToggleBulkDeleteMode = useCallback(() => {
    setIsItemSelectionMode((prev) => !prev);
    setSelectedItemIds([]);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedItemIds.length === 0) {
      showAlert({
        title: ALERT_TITLES.NOTIFICATION,
        message: ALERT_MESSAGES.DELETE_ITEMS_SELECT,
        severity: 'warning',
      });
      return;
    }

    showAlert({
      title: CONFIRM_TITLES.DELETE,
      message: CONFIRM_MESSAGES.DELETE_SELECTED_ITEMS,
      severity: 'warning',
      confirmText: '삭제',
      onConfirm: () => handleDeleteSelectedItems(selectedItemIds),
    });
  }, [selectedItemIds, showAlert, handleDeleteSelectedItems]);

  // ========== 드래그 앤 드롭 순서 변경 핸들러 ==========

  const handleDragOrderChange = useCallback((newItems: CodeItemDisplay[]) => {
    setTempSortedItems(newItems);
    setIsSortChanged(true);
  }, []);

  const handleSaveSortOrder = useCallback(async () => {
    if (!selectedGroup || !isSortChanged) return;

    try {
      const validItems = tempSortedItems.filter(
        (item) => item.code && item.code_name && item.code_group_id > 0,
      );

      if (validItems.length === 0) {
        showAlert({
          title: ALERT_TITLES.NOTIFICATION,
          message: ALERT_MESSAGES.NO_VALID_DATA_TO_SAVE,
          severity: 'warning',
        });
        return;
      }

      const updatePromises = validItems.map((item, idx) => {
        const { no, ...itemWithoutNo } = item;
        return updateItemMutation.mutateAsync({
          codeItemId: item.code_item_id,
          data: {
            code_group_id: item.code_group_id,
            code: item.code,
            code_name: item.code_name,
            sort_order: idx,
            is_active: item.is_active,
            firebaseKey: item.firebaseKey,
          },
        });
      });

      await Promise.all(updatePromises);

      showAlert({
        title: ALERT_TITLES.SUCCESS,
        message: TOAST_MESSAGES.SORT_ORDER_SAVED,
        severity: 'success',
      });

      setIsItemSortMode(false);
      setIsSortChanged(false);
      setTempSortedItems([]);
    } catch (error) {
      console.error('Failed to update sort order:', error);
      showAlert({
        title: ALERT_TITLES.ERROR,
        message: TOAST_MESSAGES.SORT_ORDER_SAVE_FAILED,
        severity: 'error',
      });
    }
  }, [selectedGroup, isSortChanged, tempSortedItems, updateItemMutation, showAlert]);

  const handleCancelSortMode = useCallback(() => {
    setIsItemSortMode(false);
    setIsSortChanged(false);
    setTempSortedItems([]);
  }, []);

  return (
    <>
      <Section>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <h2 style={{ fontSize: '1.2rem' }}>
            코드아이템 (소분류) {selectedGroup ? `- ${selectedGroup.group_name}` : ''}
          </h2>
          <Stack direction="row" spacing={1}>
            {selectedGroup && isItemSelectionMode && (
              <>
                <MediumButton variant="contained" color="error" onClick={handleConfirmDelete}>
                  삭제
                </MediumButton>
                <MediumButton variant="outlined" onClick={handleToggleBulkDeleteMode}>
                  취소
                </MediumButton>
              </>
            )}
            {selectedGroup && !isItemSortMode && !isItemSelectionMode && codeItems.length > 0 && (
              <MediumButton variant="outlined" color="error" onClick={handleToggleBulkDeleteMode}>
                일괄삭제
              </MediumButton>
            )}
            {selectedGroup && !isItemSortMode && !isItemSelectionMode && (
              <MediumButton
                variant="outlined"
                onClick={() => setIsItemSortMode(true)}
                disabled={codeItems.length === 0}
              >
                순서 편집
              </MediumButton>
            )}
            {selectedGroup && isItemSortMode && (
              <>
                <MediumButton
                  variant="contained"
                  onClick={handleSaveSortOrder}
                  disabled={!isSortChanged}
                >
                  저장
                </MediumButton>
                <MediumButton variant="outlined" onClick={handleCancelSortMode}>
                  취소
                </MediumButton>
              </>
            )}
            {!isItemSortMode && !isItemSelectionMode && (
              <MediumButton variant="contained" onClick={handleAddItem} disabled={!selectedGroup}>
                추가
              </MediumButton>
            )}
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {selectedGroup ? (
            <SortableList
              columns={codeItemColumns}
              rows={isItemSortMode && tempSortedItems.length > 0 ? tempSortedItems : codeItems}
              isLoading={isItemLoading}
              onRowClick={isItemSortMode || isItemSelectionMode ? undefined : handleItemRowClick}
              rowIdGetter={(row) => row.firebaseKey || row.code_item_id || 0}
              autoHeight={false}
              isSortMode={isItemSortMode}
              onSortChange={handleDragOrderChange}
              isSelectionMode={isItemSelectionMode}
              onSelectionChange={(ids) => setSelectedItemIds(ids)}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              코드그룹을 선택해주세요
            </Box>
          )}
        </Box>
      </Section>

      {isItemFormOpen && selectedGroup && (
        <Box sx={{ mt: 2 }}>
          <CodeItemForm
            selectedItem={isNewItem ? null : (selectedItem as CodeItem | null)}
            isNew={isNewItem}
            selectedCodeGroupId={selectedGroup.code_group_id}
            initialSortOrder={
              isNewItem && codeItems.length > 0
                ? Math.max(...codeItems.map((item) => item.sort_order)) + 1
                : 0
            }
            onSave={handleSaveItem}
            onCancel={() => setIsItemFormOpen(false)}
            onDelete={handleDeleteItem}
          />
        </Box>
      )}
    </>
  );
}
