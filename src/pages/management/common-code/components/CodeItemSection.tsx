import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  useCodeGroups,
  useCreateCodeItem,
  useUpdateCodeItem,
  useDeleteCodeItem,
  useDeleteCodeItems,
  useUpsertServiceMapping,
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

  const { data: codeGroups = [] } = useCodeGroups();
  const createItemMutation = useCreateCodeItem();
  const updateItemMutation = useUpdateCodeItem();
  const deleteItemMutation = useDeleteCodeItem();
  const deleteItemsMutation = useDeleteCodeItems();
  const upsertServiceMappingMutation = useUpsertServiceMapping();

  const [selectedItem, setSelectedItem] = useState<CodeItemDisplay | null>(null);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const [isItemSortMode, setIsItemSortMode] = useState(false); // 순서 편집 모드
  const [isItemSelectionMode, setIsItemSelectionMode] = useState(false); // 선택 모드
  const [tempSortedItems, setTempSortedItems] = useState<CodeItemDisplay[]>([]); // 임시 순서 변경 데이터
  const [isSortChanged, setIsSortChanged] = useState(false); // 순서 변경 여부
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>([]); // 선택된 아이템 ID

  // 동적 컴럼 생성
  const dynamicColumns = useMemo(() => {
    if (selectedGroup?.group_code === 'service_nm') {
      // service_nm: 정렬순서, 서비스코드(code), 서비스명(code_name), 사용여부
      return [
        {
          field: 'sort_order',
          headerName: '정렬순서',
          width: 100,
          align: 'center' as const,
          headerAlign: 'center' as const,
        },
        {
          field: 'code',
          headerName: '서비스코드',
          width: 150,
        },
        {
          field: 'code_name',
          headerName: '서비스명',
          flex: 1,
        },
        {
          field: 'is_active',
          headerName: '사용여부',
          width: 100,
          align: 'center' as const,
          headerAlign: 'center' as const,
          renderCell: (params: any) => (params.value === 0 ? '미사용' : '사용'),
        },
      ];
    }
    // 다른 그룹: 정렬순서, 코드명(code_name), 사용여부 (코드는 숨김)
    return [
      {
        field: 'sort_order',
        headerName: '정렬순서',
        width: 100,
        align: 'center' as const,
        headerAlign: 'center' as const,
      },
      {
        field: 'code_name',
        headerName: '코드명',
        flex: 1,
      },
      {
        field: 'is_active',
        headerName: '사용여부',
        width: 100,
        align: 'center' as const,
        headerAlign: 'center' as const,
        renderCell: (params: any) => (params.value === 0 ? '미사용' : '사용'),
      },
    ];
  }, [selectedGroup]);

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
      console.log('🔍 Item clicked:', item);

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
      // 코드가 비어있으면 자동 채번되므로 중복 체크 스킵
      // 단, API 레벨에서 자동 생성된 코드는 6자리(약 1600만 조합)로 충돌 가능성 거의 없음
      if (!code || code.trim() === '') {
        return false;
      }
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
        console.log('handleSaveItem:', { isNewItem, selectedItem, data });

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

          console.log('Creating new item...');

          // service_nm 그룹인 경우: service_cd 그룹에도 아이템 생성하고 매핑
          if (selectedGroup?.group_code === 'service_nm') {
            const serviceCdGroup = codeGroups.find((g) => g.group_code === 'service_cd');
            if (serviceCdGroup) {
              // 1. service_cd 그룹에 코드아이템 생성
              // code = 자동생성, code_name = 입력한 서비스코드
              const serviceCdData = {
                code_group_id: serviceCdGroup.code_group_id,
                code: '', // 자동 생성
                code_name: data.code, // 서비스코드를 code_name으로
                sort_order: data.sort_order,
                is_active: data.is_active,
              };
              const serviceCdResult = await createItemMutation.mutateAsync(serviceCdData);

              // 2. service_nm 그룹에 코드아이템 생성
              const serviceNmResult = await createItemMutation.mutateAsync(data);

              // 3. ServiceMapping 생성 (service_nm ↔ service_cd 연결)
              await upsertServiceMappingMutation.mutateAsync({
                mapping_type: 'SERVICE' as const,
                parent_code_item_id: serviceNmResult.firebaseKey || serviceNmResult.code_item_id,
                child_code_item_id: serviceCdResult.firebaseKey || serviceCdResult.code_item_id,
                sort_order: 0,
                is_active: 1,
              });
            }
          } else {
            // 일반 코드아이템 생성
            await createItemMutation.mutateAsync(data);
          }

          showAlert({
            title: ALERT_TITLES.SUCCESS,
            message: TOAST_MESSAGES.CODE_ITEM_CREATED,
            severity: 'success',
          });
        } else {
          console.log('Updating existing item...');
          if (!selectedItem) {
            console.error('selectedItem is null in update mode');
            return;
          }
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
        setSelectedItem(null);
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
      selectedGroup,
      codeGroups,
      checkItemCodeDuplicate,
      checkItemNameDuplicate,
      createItemMutation,
      updateItemMutation,
      upsertServiceMappingMutation,
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
            sort_order: idx + 1,
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
                <MediumButton
                  variant="contained"
                  color="error"
                  onClick={handleConfirmDelete}
                  subType="d"
                >
                  삭제
                </MediumButton>
                <MediumButton variant="outlined" onClick={handleToggleBulkDeleteMode} subType="etc">
                  취소
                </MediumButton>
              </>
            )}
            {selectedGroup && !isItemSortMode && !isItemSelectionMode && codeItems.length > 0 && (
              <MediumButton
                variant="outlined"
                color="error"
                onClick={handleToggleBulkDeleteMode}
                subType="d"
              >
                일괄삭제
              </MediumButton>
            )}
            {selectedGroup && !isItemSortMode && !isItemSelectionMode && (
              <MediumButton
                variant="outlined"
                onClick={() => setIsItemSortMode(true)}
                disabled={codeItems.length === 0}
                subType="u"
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
                  subType="u"
                >
                  저장
                </MediumButton>
                <MediumButton variant="outlined" onClick={handleCancelSortMode} subType="etc">
                  취소
                </MediumButton>
              </>
            )}
            {!isItemSortMode && !isItemSelectionMode && (
              <MediumButton
                variant="contained"
                onClick={handleAddItem}
                disabled={!selectedGroup}
                subType="c"
              >
                추가
              </MediumButton>
            )}
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {selectedGroup ? (
            <SortableList
              columns={dynamicColumns}
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
            selectedItem={isNewItem ? null : selectedItem}
            isNew={isNewItem}
            selectedCodeGroupId={selectedGroup.code_group_id}
            groupCode={selectedGroup.group_code}
            initialSortOrder={
              isNewItem && codeItems.length > 0
                ? Math.max(...codeItems.map((item) => item.sort_order)) + 1
                : 1
            }
            onSave={handleSaveItem}
            onCancel={() => {
              setIsItemFormOpen(false);
              setIsNewItem(false);
              setSelectedItem(null);
            }}
            onDelete={handleDeleteItem}
          />
        </Box>
      )}
    </>
  );
}
