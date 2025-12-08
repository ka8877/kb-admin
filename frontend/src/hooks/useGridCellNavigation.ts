import { useCallback, useRef } from 'react';
import type { GridColDef, GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useGridApiRef } from '@mui/x-data-grid';
import type { SelectFieldOption } from '@/types/types';

export type UseGridCellNavigationOptions<T extends GridValidRowModel> = {
  isEditMode: boolean;
  data: T[];
  processedColumns: GridColDef<T>[];
  readOnlyFields?: string[];
  selectFields?: Record<string, SelectFieldOption[]>;
  dateFields?: string[];
  dynamicSelectFields?: string[];
  getRowId: (row: T) => string | number;
  dataGridRef: React.MutableRefObject<ReturnType<typeof useGridApiRef>['current'] | null>;
};

export type CellNavigationHandlers = {
  handleCellKeyDown: (params: any, event: React.KeyboardEvent) => void;
  handleCellEditStop: (params: any) => void;
};

/**
 * 그리드 셀 네비게이션을 위한 공통 hook
 * Tab/Enter 키 처리를 담당
 */
export const useGridCellNavigation = <T extends GridValidRowModel = GridValidRowModel>({
  isEditMode,
  data,
  processedColumns,
  readOnlyFields = [],
  selectFields,
  dateFields,
  dynamicSelectFields = [],
  getRowId,
  dataGridRef,
}: UseGridCellNavigationOptions<T>): CellNavigationHandlers => {
  const tabKeyPressedRef = useRef<{ field: string; rowId: string | number } | null>(null);
  const shouldMoveToNextCellRef = useRef(false);

  // 다음 편집 가능한 셀 찾기
  const findNextEditableCell = useCallback(
    (
      currentField: string,
      currentRowIndex: number,
    ): { field: string; rowId: string | number } | null => {
      const currentColIndex = processedColumns.findIndex((col) => col.field === currentField);
      if (currentColIndex === -1) return null;

      // 같은 행에서 다음 셀 찾기
      for (let i = currentColIndex + 1; i < processedColumns.length; i++) {
        const col = processedColumns[i];
        if (col.editable && !readOnlyFields.includes(col.field)) {
          return { field: col.field, rowId: getRowId(data[currentRowIndex]) };
        }
      }

      // 다음 행의 첫 번째 편집 가능한 셀 찾기
      if (currentRowIndex + 1 < data.length) {
        for (let i = 0; i < processedColumns.length; i++) {
          const col = processedColumns[i];
          if (col.editable && !readOnlyFields.includes(col.field)) {
            return { field: col.field, rowId: getRowId(data[currentRowIndex + 1]) };
          }
        }
      }

      return null;
    },
    [processedColumns, readOnlyFields, data, getRowId],
  );

  // 다음 셀로 이동하는 함수 (포커스만 이동, 편집 모드 진입 안 함)
  const moveToNextCell = useCallback(
    (rowId: string | number, currentField: string) => {
      const currentRowIndex = data.findIndex((row) => getRowId(row) === rowId);
      if (currentRowIndex === -1) return;

      const nextCell = findNextEditableCell(currentField, currentRowIndex);

      if (nextCell && dataGridRef.current) {
        setTimeout(() => {
          if (dataGridRef.current) {
            dataGridRef.current.setCellFocus(nextCell.rowId, nextCell.field);

            // 셀이 보이도록 스크롤 (가로/세로 모두)
            const cellElement = dataGridRef.current.getCellElement(nextCell.rowId, nextCell.field);
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
        // 다음 편집 가능한 셀이 없으면 현재 셀에 포커스 유지
        setTimeout(() => {
          if (dataGridRef.current) {
            dataGridRef.current.setCellFocus(rowId, currentField);
          }
        }, 50);
      }
    },
    [data, getRowId, findNextEditableCell, dataGridRef],
  );

  // 셀 편집 종료 핸들러
  const handleCellEditStop = useCallback(
    (params: any) => {
      if (!isEditMode) return;

      const currentField = params.field;
      const rowId = params.id;

      // 현재 셀이 selectbox인지 확인
      const currentColumn = processedColumns.find((col) => col.field === currentField);
      const isDynamicSelectField = dynamicSelectFields.includes(currentField);
      const isSelectField =
        currentColumn?.type === 'singleSelect' ||
        (selectFields && selectFields[currentField]) ||
        isDynamicSelectField;

      if (isSelectField) {
        // Tab 키가 눌린 경우에만 다음 셀로 포커스 이동
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

        // 탭 키가 아닌 경우 자동 이동 방지
        if (
          tabKeyPressedRef.current &&
          tabKeyPressedRef.current.field === currentField &&
          tabKeyPressedRef.current.rowId === rowId
        ) {
          tabKeyPressedRef.current = null;
        }
        shouldMoveToNextCellRef.current = false;

        // 현재 셀에 포커스를 다시 설정 (자동 이동 방지)
        setTimeout(() => {
          if (dataGridRef.current) {
            dataGridRef.current.setCellFocus(rowId, currentField);
          }
        }, 10);
      }
    },
    [isEditMode, moveToNextCell, processedColumns, selectFields, dynamicSelectFields, dataGridRef],
  );

  // 셀 키보드 이벤트 핸들러
  const handleCellKeyDown = useCallback(
    (params: any, event: React.KeyboardEvent) => {
      if (!isEditMode) return;

      // Tab 키 처리: 다음 셀로 포커스 이동
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();

        const currentField = params.field;
        const rowId = params.id;
        const isEditing = params.cellMode === 'edit';

        const currentColumn = processedColumns.find((col) => col.field === currentField);
        const isDynamicSelectField = dynamicSelectFields.includes(currentField);
        const isSelectField =
          currentColumn?.type === 'singleSelect' ||
          (selectFields && selectFields[currentField]) ||
          isDynamicSelectField;

        if (isEditing) {
          if (isSelectField) {
            tabKeyPressedRef.current = { field: currentField, rowId };
            shouldMoveToNextCellRef.current = true;
          } else {
            shouldMoveToNextCellRef.current = true;
            if (dataGridRef.current) {
              try {
                dataGridRef.current.stopCellEditMode({
                  id: rowId,
                  field: currentField,
                  ignoreModifications: false,
                });
              } catch (error) {
                console.debug('Cell not in edit mode:', error);
              }
            }
            setTimeout(() => {
              moveToNextCell(rowId, currentField);
            }, 50);
          }
        } else {
          moveToNextCell(rowId, currentField);
        }
      } else if (event.key === 'Enter') {
        // Enter 키 처리
        const currentField = params.field;
        const rowId = params.id;
        const isEditing = params.cellMode === 'edit';
        const currentColumn = processedColumns.find((col) => col.field === currentField);
        const isDynamicSelectField = dynamicSelectFields.includes(currentField);
        const isSelectField =
          currentColumn?.type === 'singleSelect' ||
          (selectFields && selectFields[currentField]) ||
          isDynamicSelectField;
        const isDateField = dateFields && dateFields.includes(currentField);

        // 편집 모드가 아닌 경우: 편집 모드로 진입
        // - input: 편집 모드 진입
        // - selectbox: 편집 모드 진입 (옵션 펼침)
        // - date: 편집 모드 진입 (달력 열림)
        if (!isEditing) {
          event.preventDefault();
          event.stopPropagation();
          if (dataGridRef.current) {
            dataGridRef.current.startCellEditMode({
              id: rowId,
              field: currentField,
            });
          }
          return;
        }

        // 편집 모드인 경우
        // 날짜 필드: Enter 키가 DateTimePicker 내부로 전파되어 달력이 열림 (preventDefault 하지 않음)
        if (isDateField) {
          return;
        }

        // 편집 중인 일반 인풋 필드에서 Enter 키: 편집 종료 후 현재 셀에 포커스 유지
        if (!isSelectField && !isDateField && isEditing) {
          event.preventDefault();
          event.stopPropagation();
          if (dataGridRef.current) {
            try {
              dataGridRef.current.stopCellEditMode({
                id: rowId,
                field: currentField,
                ignoreModifications: false,
              });
            } catch (error) {
              console.debug('Cell not in edit mode:', error);
            }
          }
          setTimeout(() => {
            if (dataGridRef.current) {
              dataGridRef.current.setCellFocus(rowId, currentField);
            }
          }, 50);
          return;
        }

        if (isSelectField) {
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
      dateFields,
      moveToNextCell,
      dataGridRef,
    ],
  );

  return {
    handleCellKeyDown,
    handleCellEditStop,
  };
};
