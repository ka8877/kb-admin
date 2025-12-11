import { useCallback, useMemo, useRef, useEffect } from 'react';
import type {
  GridPaginationModel,
  GridRowSelectionModel,
  GridValidRowModel,
} from '@mui/x-data-grid';

export type UsePaginationRowSelectionOptions<T extends GridValidRowModel> = {
  rows: T[];
  paginationModel: GridPaginationModel;
  getRowId: (row: T) => string | number;
  selectionModel: GridRowSelectionModel;
  setSelectionModel: (newSelection: GridRowSelectionModel) => void;
};

/**
 * 페이지네이션을 고려한 행 선택 관리 Hook
 * 헤더 체크박스 클릭 시 현재 페이지의 행만 선택되도록 처리
 */
export const usePaginationRowSelection = <T extends GridValidRowModel>({
  rows,
  paginationModel,
  getRowId,
  selectionModel,
  setSelectionModel,
}: UsePaginationRowSelectionOptions<T>) => {
  // 이전 선택 상태 추적
  const prevSelectionRef = useRef<GridRowSelectionModel>(selectionModel);
  const isProcessingRef = useRef(false);

  // selectionModel이 외부에서 변경될 때 prevSelectionRef 업데이트
  useEffect(() => {
    if (!isProcessingRef.current) {
      prevSelectionRef.current = selectionModel;
    }
  }, [selectionModel]);

  // 현재 페이지의 행 ID 목록 계산
  const currentPageRowIds = useMemo(() => {
    const { page, pageSize } = paginationModel;
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageRows = rows.slice(startIndex, endIndex);
    return currentPageRows.map((row) => getRowId(row));
  }, [rows, paginationModel, getRowId]);

  // 행 선택 변경 핸들러 (페이지네이션 고려)
  const handleRowSelectionModelChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      isProcessingRef.current = true;
      const prevSelection = prevSelectionRef.current;

      // 현재 페이지의 모든 행 ID
      const currentPageIdsSet = new Set(currentPageRowIds);

      // 이전 선택에서 다른 페이지의 행들
      const otherPageSelected = prevSelection.filter((id) => !currentPageIdsSet.has(id));

      // 새로 추가된 행들
      const addedIds = newSelection.filter((id) => !prevSelection.includes(id));

      // 현재 페이지에 없는 행이 새로 선택되었는지 확인 (헤더 체크박스로 전체 선택 시 발생)
      const addedNonCurrentPageRows = addedIds.some((id) => !currentPageIdsSet.has(id));

      if (addedNonCurrentPageRows) {
        // 다른 페이지의 행이 자동으로 선택됨 -> 헤더 체크박스 클릭으로 간주
        // 현재 페이지만 선택하도록 강제 (기존 다른 페이지 선택은 유지)
        // newSelection에서 현재 페이지에 해당하는 것만 가져옴 (isRowSelectable 고려됨)
        const currentPageSelection = newSelection.filter((id) => currentPageIdsSet.has(id));
        const finalSelection = [...otherPageSelected, ...currentPageSelection];

        prevSelectionRef.current = finalSelection;
        setSelectionModel(finalSelection);
        isProcessingRef.current = false;
        return;
      }

      // 선택 해제된 행들
      const removedIds = prevSelection.filter((id) => !newSelection.includes(id));

      // 현재 페이지 외의 행들도 해제되었는지 확인 (헤더 체크박스로 전체 해제 시 발생)
      const removedNonCurrentPageRows = removedIds.some((id) => !currentPageIdsSet.has(id));

      if (removedNonCurrentPageRows) {
        // 다른 페이지 행까지 해제됨 -> 헤더 체크박스 해제로 간주
        // 다른 페이지 선택 복구, 현재 페이지는 해제 상태 유지
        const finalSelection = otherPageSelected;

        prevSelectionRef.current = finalSelection;
        setSelectionModel(finalSelection);
        isProcessingRef.current = false;
        return;
      }

      // 일반적인 행 선택/해제는 그대로 처리
      prevSelectionRef.current = newSelection;
      setSelectionModel(newSelection);
      isProcessingRef.current = false;
    },
    [currentPageRowIds, setSelectionModel],
  );

  return {
    handleRowSelectionModelChange,
    currentPageRowIds,
  };
};
