import { useCallback } from 'react';
import type { GridValidRowModel, GridColDef, GridCellParams } from '@mui/x-data-grid';
import { useGridApiRef } from '@mui/x-data-grid';
import type { SelectFieldOption } from '@/types/types';
import { isSelectField as checkIsSelectField } from '../utils/columnUtils';

type UseDataDetailKeyboardParams<T extends GridValidRowModel> = {
  isEditMode: boolean;
  processedColumns: GridColDef<T>[];
  readOnlyFields: string[];
  selectFields?: Record<string, SelectFieldOption[]>;
  dynamicSelectFields?: Record<string, (data: T | undefined) => SelectFieldOption[]>;
  dataGridRef: ReturnType<typeof useGridApiRef>;
  tabKeyPressedRef: React.MutableRefObject<{ field: string; rowId: string | number } | null>;
  shouldMoveToNextCellRef: React.MutableRefObject<boolean>;
};

/**
 * DataDetail 컴포넌트의 키보드 이벤트 처리 훅
 */
export const useDataDetailKeyboard = <T extends GridValidRowModel>({
  isEditMode,
  processedColumns,
  readOnlyFields,
  selectFields,
  dynamicSelectFields,
  dataGridRef,
  tabKeyPressedRef,
  shouldMoveToNextCellRef,
}: UseDataDetailKeyboardParams<T>) => {
  // 다음 편집 가능한 셀 찾기
  const findNextEditableCell = useCallback(
    (currentField: string): { field: string; colIndex: number } | null => {
      const currentIndex = processedColumns.findIndex((col) => col.field === currentField);
      if (currentIndex === -1) return null;

      for (let i = currentIndex + 1; i < processedColumns.length; i++) {
        const col = processedColumns[i];
        if (col.editable && !readOnlyFields.includes(col.field)) {
          return { field: col.field, colIndex: i };
        }
      }

      return null;
    },
    [processedColumns, readOnlyFields],
  );

  // 다음 셀로 이동하는 함수
  const moveToNextCell = useCallback(
    (rowId: string | number, currentField: string) => {
      const nextCell = findNextEditableCell(currentField);

      if (nextCell && dataGridRef.current) {
        setTimeout(() => {
          if (dataGridRef.current) {
            dataGridRef.current.setCellFocus(rowId, nextCell.field);
            const cellElement = dataGridRef.current.getCellElement(rowId, nextCell.field);
            if (cellElement) {
              cellElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
              });
            }
          }
        }, 50);
      } else {
        setTimeout(() => {
          if (dataGridRef.current) {
            dataGridRef.current.setCellFocus(rowId, currentField);
          }
        }, 50);
      }
    },
    [findNextEditableCell, dataGridRef],
  );

  // 셀 편집 종료 핸들러
  const handleCellEditStop = useCallback(
    (params: GridCellParams) => {
      if (!isEditMode) return;

      const currentField = params.field;
      const rowId = params.id;

      const isSelect = checkIsSelectField(
        currentField,
        processedColumns,
        selectFields,
        dynamicSelectFields,
      );

      if (isSelect) {
        if (shouldMoveToNextCellRef.current && tabKeyPressedRef.current) {
          const { field, rowId: tabRowId } = tabKeyPressedRef.current;
          if (currentField === field && rowId === tabRowId) {
            tabKeyPressedRef.current = null;
            shouldMoveToNextCellRef.current = false;
            setTimeout(() => {
              moveToNextCell(rowId, field);
            }, 50);
            return;
          }
        }

        if (
          tabKeyPressedRef.current &&
          tabKeyPressedRef.current.field === currentField &&
          tabKeyPressedRef.current.rowId === rowId
        ) {
          tabKeyPressedRef.current = null;
        }
        shouldMoveToNextCellRef.current = false;

        setTimeout(() => {
          if (dataGridRef.current) {
            dataGridRef.current.setCellFocus(rowId, currentField);
          }
        }, 10);
      }
    },
    [
      isEditMode,
      moveToNextCell,
      processedColumns,
      selectFields,
      dynamicSelectFields,
      dataGridRef,
      tabKeyPressedRef,
      shouldMoveToNextCellRef,
    ],
  );

  // 셀 키보드 이벤트 핸들러
  const handleCellKeyDown = useCallback(
    (params: GridCellParams, event: React.KeyboardEvent) => {
      if (!isEditMode) return;

      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();

        const currentField = params.field;
        const rowId = params.id;
        const isEditing = params.cellMode === 'edit';
        const isSelect = checkIsSelectField(
          currentField,
          processedColumns,
          selectFields,
          dynamicSelectFields,
        );

        if (isEditing) {
          if (isSelect) {
            tabKeyPressedRef.current = { field: currentField, rowId };
            shouldMoveToNextCellRef.current = true;
          } else {
            shouldMoveToNextCellRef.current = true;
            if (dataGridRef.current) {
              dataGridRef.current.stopCellEditMode({
                id: rowId,
                field: currentField,
                ignoreModifications: false,
              });
            }
            setTimeout(() => {
              moveToNextCell(rowId, currentField);
            }, 50);
          }
        } else {
          moveToNextCell(rowId, currentField);
        }
      } else if (event.key === 'Enter') {
        const currentField = params.field;
        const rowId = params.id;
        const isSelect = checkIsSelectField(
          currentField,
          processedColumns,
          selectFields,
          dynamicSelectFields,
        );

        if (isSelect) {
          shouldMoveToNextCellRef.current = false;
          if (
            tabKeyPressedRef.current &&
            tabKeyPressedRef.current.field === currentField &&
            tabKeyPressedRef.current.rowId === rowId
          ) {
            tabKeyPressedRef.current = null;
          }
        }
      }
    },
    [
      isEditMode,
      processedColumns,
      selectFields,
      dynamicSelectFields,
      moveToNextCell,
      dataGridRef,
      tabKeyPressedRef,
      shouldMoveToNextCellRef,
    ],
  );

  return {
    handleCellKeyDown,
    handleCellEditStop,
  };
};
