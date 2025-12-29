import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Stack, Box } from '@mui/material';
import SortableList from '@/components/common/list/SortableList';
import MediumButton from '@/components/common/button/MediumButton';
import CodeItemForm from './CodeItemForm';
import Section from '@/components/layout/Section';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import {
  ALERT_TITLES,
  ALERT_MESSAGES,
  TOAST_MESSAGES,
  getCodeItemDeleteSuccessMessage,
} from '@/constants/message';
import type { CodeItem, CodeItemDisplay, CodeGroupDisplay } from '../types';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  useCodeItems,
  useCreateCodeItem,
  useUpdateCodeItem,
  useDeleteCodeItem,
  useDeleteCodeItems,
  useReorderCodeItems,
} from '../hooks';

interface CodeItemSectionProps {
  selectedGroup: CodeGroupDisplay | null;
}

const CodeItemSection: React.FC<CodeItemSectionProps> = ({ selectedGroup }) => {
  const { showAlert } = useAlertDialog();

  // 코드아이템 (소분류) State & Hooks
  const {
    data: codeItems = [],
    isLoading: isItemLoading,
    refetch: refetchCodeItems,
  } = useCodeItems(selectedGroup ? { groupCode: selectedGroup.groupCode } : undefined);

  const createItemMutation = useCreateCodeItem();
  const updateItemMutation = useUpdateCodeItem();
  const deleteItemMutation = useDeleteCodeItem();
  const deleteItemsMutation = useDeleteCodeItems();
  const reorderItemsMutation = useReorderCodeItems();

  const [selectedItem, setSelectedItem] = useState<CodeItemDisplay | null>(null);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const [isItemSortMode, setIsItemSortMode] = useState(false); // 정렬 편집 모드
  const [isItemSelectionMode, setIsItemSelectionMode] = useState(false); // 선택 모드
  const [tempSortedItems, setTempSortedItems] = useState<CodeItemDisplay[]>([]); // 임시 정렬 변경 아이템
  const [isSortChanged, setIsSortChanged] = useState(false); // 정렬 변경 여부
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>([]); // 선택된 아이템 ID

  // 동적 컬럼 생성
  const dynamicColumns = useMemo((): GridColDef<CodeItemDisplay>[] => {
    if (selectedGroup?.groupCode === 'service_nm') {
      // service_nm: 정렬순서, 서비스코드(code), 서비스명(codeName), 사용여부
      return [
        {
          field: 'sortOrder',
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
          field: 'codeName',
          headerName: '서비스명',
          flex: 1,
        },
        {
          field: 'isActive',
          headerName: '사용여부',
          width: 100,
          align: 'center' as const,
          headerAlign: 'center' as const,
          renderCell: (params: GridRenderCellParams<CodeItemDisplay>) =>
            params.value ? '사용' : '미사용',
        },
      ];
    }
    // 다른 그룹: 정렬순서, 코드명(codeName), 사용여부 (코드는 숨김)
    return [
      {
        field: 'sortOrder',
        headerName: '정렬순서',
        width: 100,
        align: 'center' as const,
        headerAlign: 'center' as const,
      },
      {
        field: 'codeName',
        headerName: '코드명',
        flex: 1,
      },
      {
        field: 'isActive',
        headerName: '사용여부',
        width: 100,
        align: 'center' as const,
        headerAlign: 'center' as const,
        renderCell: (params: GridRenderCellParams<CodeItemDisplay>) =>
          params.value ? '사용' : '미사용',
      },
    ];
  }, [selectedGroup?.groupCode]);

  // 코드아이템 (소분류) 추가 및 수정 로직
  const handleItemRowClick = useCallback(
    (params: { id: string | number; row: CodeItemDisplay }) => {
      const item = params.row;
      setSelectedItem(item);
      setIsItemFormOpen(true);
      setIsNewItem(false);
    },
    []
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
    (code: string) => {
      return codeItems.some((item) => item.code === code);
    },
    [codeItems]
  );

  const handleSaveItem = useCallback(
    async (data: Omit<CodeItem, 'codeItemId' | 'codeGroupId'>) => {
      if (!selectedGroup) {
        showAlert({
          title: ALERT_TITLES.ERROR,
          message: ALERT_MESSAGES.SELECT_CODE_GROUP_FIRST,
          severity: 'error',
        });
        return;
      }

      try {
        if (isNewItem) {
          if (checkItemCodeDuplicate(data.code)) {
            showAlert({
              title: ALERT_TITLES.NOTIFICATION,
              message: ALERT_MESSAGES.CODE_ALREADY_EXISTS,
              severity: 'warning',
            });
            return;
          }

          await createItemMutation.mutateAsync({
            groupCode: selectedGroup.groupCode,
            data: {
              code: data.code,
              codeName: data.codeName,
              sortOrder: data.sortOrder,
            },
          });

          showAlert({
            title: ALERT_TITLES.SUCCESS,
            message: TOAST_MESSAGES.CODE_ITEM_CREATED,
            severity: 'success',
          });
        } else if (selectedItem) {
          await updateItemMutation.mutateAsync({
            codeItemId: selectedItem.codeItemId,
            data: {
              code: data.code,
              codeName: data.codeName,
              sortOrder: data.sortOrder,
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
      checkItemCodeDuplicate,
      createItemMutation,
      updateItemMutation,
      showAlert,
    ]
  );

  const handleDeleteItem = useCallback(async () => {
    if (!selectedItem || !selectedGroup) return;

    try {
      await deleteItemMutation.mutateAsync(selectedItem.codeItemId);

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
  }, [selectedItem, selectedGroup, deleteItemMutation, showAlert]);

  const handleCancelForm = useCallback(() => {
    setIsItemFormOpen(false);
    setSelectedItem(null);
  }, []);

  // 정렬 편집 모드
  const handleStartSortMode = useCallback(() => {
    setIsItemSortMode(true);
    setTempSortedItems([...codeItems]);
    setIsSortChanged(false);
  }, [codeItems]);

  const handleCancelSortMode = useCallback(() => {
    setIsItemSortMode(false);
    setTempSortedItems([]);
    setIsSortChanged(false);
  }, []);

  const handleSaveSortOrder = useCallback(async () => {
    if (!selectedGroup || !isSortChanged) return;

    try {
      const sortOrderUpdates = tempSortedItems.map((item, index) => ({
        codeItemId: item.codeItemId,
        sortOrder: index + 1,
      }));

      await reorderItemsMutation.mutateAsync({
        groupCode: selectedGroup.groupCode,
        items: sortOrderUpdates,
      });

      showAlert({
        title: ALERT_TITLES.SUCCESS,
        message: TOAST_MESSAGES.SORT_ORDER_SAVED,
        severity: 'success',
      });

      setIsItemSortMode(false);
      setTempSortedItems([]);
      setIsSortChanged(false);
      await refetchCodeItems();
    } catch (error) {
      console.error('Failed to save sort order:', error);
      showAlert({
        title: ALERT_TITLES.ERROR,
        message: TOAST_MESSAGES.SORT_ORDER_SAVE_FAILED,
        severity: 'error',
      });
    }
  }, [
    selectedGroup,
    isSortChanged,
    tempSortedItems,
    reorderItemsMutation,
    showAlert,
    refetchCodeItems,
  ]);

  const handleRowReorder = useCallback((newRows: CodeItemDisplay[]) => {
    setTempSortedItems(newRows);
    setIsSortChanged(true);
  }, []);

  // 선택 모드
  const handleStartSelectionMode = useCallback(() => {
    setIsItemSelectionMode(true);
    setSelectedItemIds([]);
  }, []);

  const handleCancelSelectionMode = useCallback(() => {
    setIsItemSelectionMode(false);
    setSelectedItemIds([]);
  }, []);

  const handleDeleteSelectedItems = useCallback(async () => {
    if (!selectedGroup || selectedItemIds.length === 0) return;

    try {
      const numericIds = selectedItemIds.map((id) => Number(id));
      await deleteItemsMutation.mutateAsync(numericIds);

      showAlert({
        title: ALERT_TITLES.SUCCESS,
        message: getCodeItemDeleteSuccessMessage(selectedItemIds.length),
        severity: 'success',
      });

      setIsItemSelectionMode(false);
      setSelectedItemIds([]);
    } catch (error) {
      console.error('Failed to delete selected items:', error);
      showAlert({
        title: ALERT_TITLES.ERROR,
        message: TOAST_MESSAGES.CODE_ITEM_DELETE_FAILED,
        severity: 'error',
      });
    }
  }, [selectedGroup, selectedItemIds, deleteItemsMutation, showAlert]);

  useEffect(() => {
    if (!selectedGroup) {
      setIsItemFormOpen(false);
      setIsItemSortMode(false);
      setIsItemSelectionMode(false);
      setSelectedItem(null);
      setTempSortedItems([]);
      setSelectedItemIds([]);
    }
  }, [selectedGroup]);

  const renderActionButtons = () => {
    if (isItemSortMode) {
      return (
        <Stack direction="row" spacing={1}>
          <MediumButton variant="outlined" onClick={handleCancelSortMode} subType="u">
            취소
          </MediumButton>
          <MediumButton
            variant="contained"
            onClick={handleSaveSortOrder}
            disabled={!isSortChanged}
            subType="c"
          >
            저장
          </MediumButton>
        </Stack>
      );
    }

    if (isItemSelectionMode) {
      return (
        <Stack direction="row" spacing={1}>
          <MediumButton variant="outlined" onClick={handleCancelSelectionMode} subType="u">
            취소
          </MediumButton>
          <MediumButton
            variant="contained"
            onClick={handleDeleteSelectedItems}
            disabled={selectedItemIds.length === 0}
            subType="d"
          >
            선택 삭제
          </MediumButton>
        </Stack>
      );
    }

    return (
      <Stack direction="row" spacing={1}>
        <MediumButton variant="outlined" onClick={handleStartSortMode} subType="u">
          정렬편집
        </MediumButton>
        <MediumButton variant="outlined" onClick={handleStartSelectionMode} subType="u">
          선택
        </MediumButton>
        <MediumButton variant="contained" onClick={handleAddItem} subType="c">
          추가
        </MediumButton>
      </Stack>
    );
  };

  return (
    <>
      <Section>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <h2 style={{ fontSize: '1.2rem' }}>코드아이템 (소분류)</h2>
          {selectedGroup && renderActionButtons()}
        </Stack>

        {!selectedGroup ? (
          <Box
            sx={{
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            왼쪽에서 코드그룹을 선택하세요
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <SortableList
              columns={dynamicColumns}
              rows={isItemSortMode ? tempSortedItems : codeItems}
              isLoading={isItemLoading}
              onRowClick={!isItemSortMode && !isItemSelectionMode ? handleItemRowClick : undefined}
              isSortMode={isItemSortMode}
              isSelectionMode={isItemSelectionMode}
              onSortChange={handleRowReorder}
              onSelectionChange={setSelectedItemIds}
              rowIdGetter={(row) => row.codeItemId || 0}
              autoHeight={false}
            />
          </Box>
        )}
      </Section>

      {isItemFormOpen && selectedGroup && (
        <Box sx={{ mt: 2 }}>
          <CodeItemForm
            selectedItem={isNewItem ? null : selectedItem}
            isNew={isNewItem}
            selectedCodeGroupId={selectedGroup.codeGroupId}
            groupCode={selectedGroup.groupCode}
            onSave={handleSaveItem}
            onCancel={handleCancelForm}
            onDelete={handleDeleteItem}
          />
        </Box>
      )}
    </>
  );
};

export default CodeItemSection;
