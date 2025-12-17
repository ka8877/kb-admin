import { useState, useCallback, useEffect, useRef } from 'react';
import type { GridValidRowModel } from '@mui/x-data-grid';
import { useGridApiRef } from '@mui/x-data-grid';

type UseDataDetailStateParams<T> = {
  data: T | undefined;
  columns: Array<{ field: string }>;
  readOnlyFields: string[];
  getRowId: (row: T) => string | number;
  dataGridRef: ReturnType<typeof useGridApiRef>;
};

/**
 * DataDetail 컴포넌트의 상태 관리 훅
 */
export const useDataDetailState = <T extends GridValidRowModel>({
  data,
  columns,
  readOnlyFields,
  getRowId,
  dataGridRef,
}: UseDataDetailStateParams<T>) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<T | undefined>(data);
  const [hasInitialFocus, setHasInitialFocus] = useState(false);
  const tabKeyPressedRef = useRef<{ field: string; rowId: string | number } | null>(null);
  const shouldMoveToNextCellRef = useRef(false);

  // 수정 모드로 전환
  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
    setEditedData(data);
  }, [data]);

  // 수정 취소
  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setEditedData(data);
    setHasInitialFocus(false);
    tabKeyPressedRef.current = null;
    shouldMoveToNextCellRef.current = false;
  }, [data]);

  // 수정 모드 진입 시 첫 번째 편집 가능한 셀에 포커싱
  useEffect(() => {
    if (isEditMode && !hasInitialFocus && dataGridRef.current && editedData) {
      setTimeout(() => {
        const firstEditableColumn = columns.find((col) => !readOnlyFields.includes(col.field));

        if (firstEditableColumn && dataGridRef.current) {
          const rowId = getRowId(editedData);
          try {
            dataGridRef.current.setCellFocus(rowId, firstEditableColumn.field);
            setTimeout(() => {
              if (dataGridRef.current) {
                dataGridRef.current.startCellEditMode({
                  id: rowId,
                  field: firstEditableColumn.field,
                });
              }
            }, 50);
            setHasInitialFocus(true);
          } catch (error) {
            console.warn('포커싱/편집 모드 진입 실패:', error);
          }
        }
      }, 100);
    } else if (!isEditMode) {
      setHasInitialFocus(false);
    }
  }, [isEditMode, hasInitialFocus, editedData, columns, readOnlyFields, getRowId, dataGridRef]);

  // data 변경 시 editedData 동기화
  useEffect(() => {
    if (!isEditMode) {
      setEditedData(data);
    }
  }, [data, isEditMode]);

  return {
    isEditMode,
    editedData,
    hasInitialFocus,
    tabKeyPressedRef,
    shouldMoveToNextCellRef,
    setIsEditMode,
    setEditedData,
    setHasInitialFocus,
    handleEditClick,
    handleCancelEdit,
  };
};
