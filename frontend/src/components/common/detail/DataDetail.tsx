// frontend/src/components/common/detail/DataDetail.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import DetailEditActions from '../actions/DetailEditActions';
import DataDetailActions from '../actions/DataDetailActions';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { toast } from 'react-toastify';

export type DataDetailProps<T extends GridValidRowModel = GridValidRowModel> = {
  data?: T;
  columns: GridColDef<T>[];
  isLoading?: boolean;
  rowIdGetter?: keyof T | ((row: T) => string | number);
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  onSave?: (updatedData: T) => Promise<void> | void;
  size?: 'small' | 'medium';
  readOnlyFields?: string[]; // No, qst_id 같은 수정 불가 필드들
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: DataDetailProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) return (row as any).id ?? (row as any).id_str ?? '';
    if (typeof getter === 'function') return getter(row);
    return (row as any)[getter as string];
  };

const DataDetail = <T extends GridValidRowModel = GridValidRowModel>({
  data,
  columns,
  isLoading,
  rowIdGetter,
  onEdit,
  onDelete,
  onBack,
  onSave,
  size = 'small',
  readOnlyFields = ['No', 'qst_id'], // 기본적으로 No, qst_id는 수정 불가
}: DataDetailProps<T>): JSX.Element => {
  const getRowId = defaultGetRowId<T>(rowIdGetter);
  const { showConfirm } = useConfirmDialog();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<T | undefined>(data);
  const dataGridRef = useGridApiRef();

  // 수정 모드로 전환
  const handleEditClick = () => {
    setIsEditMode(true);
    setEditedData(data);
    // onEdit는 화면 이동용이므로 호출하지 않음
  };

  // 수정 모드 진입 시에만 첫 번째 편집 가능한 셀에 포커싱 및 편집 모드 진입
  const [hasInitialFocus, setHasInitialFocus] = useState(false);

  useEffect(() => {
    if (isEditMode && !hasInitialFocus && dataGridRef.current && editedData) {
      // 약간의 지연 후 포커싱 (DataGrid 렌더링 완료 후)
      setTimeout(() => {
        const firstEditableColumn = columns.find((col) => !readOnlyFields.includes(col.field));

        if (firstEditableColumn && dataGridRef.current) {
          const rowId = getRowId(editedData);
          try {
            // 셀에 포커스를 주고 바로 편집 모드로 진입
            dataGridRef.current.setCellFocus(rowId, firstEditableColumn.field);
            // 약간의 추가 지연 후 편집 모드 시작 (포커싱 후)
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
      // 수정 모드를 벗어나면 초기 포커스 상태를 리셋
      setHasInitialFocus(false);
    }
  }, [isEditMode, hasInitialFocus, editedData, columns, readOnlyFields, getRowId]);

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedData(data);
    setHasInitialFocus(false);
  };

  // 저장 확인
  const handleSaveClick = () => {
    showConfirm({
      title: '저장 확인',
      message: '변경사항을 저장하시겠습니까?',
      onConfirm: async () => {
        if (editedData && onSave) {
          try {
            await onSave(editedData);
            toast.success('수정을 요청하였습니다.');
            setIsEditMode(false);
            setHasInitialFocus(false);
          } catch (error) {
            toast.error('수정을 실패하였습니다.');
            console.error('저장 실패:', error);
          }
        }
      },
    });
  };

  // 컬럼을 수정 모드에 맞게 변환
  const processedColumns = columns.map((col) => {
    if (isEditMode && !readOnlyFields.includes(col.field)) {
      return {
        ...col,
        editable: true,
      };
    }
    return {
      ...col,
      editable: false,
    };
  });

  // 행 업데이트 처리
  const processRowUpdate = (newRow: T, oldRow: T) => {
    setEditedData(newRow);
    return newRow;
  };

  return (
    <Box>
      {/* 일반 모드 액션 버튼들 */}
      {!isEditMode && (
        <DataDetailActions
          onBack={onBack}
          onEdit={onSave ? handleEditClick : undefined}
          onDelete={onDelete}
          showEdit={!!onSave}
          showDelete={!!onDelete}
        />
      )}

      <Box sx={{ width: '100%' }}>
        <DataGrid
          apiRef={dataGridRef}
          rows={editedData ? [editedData] : data ? [data] : []}
          columns={processedColumns}
          getRowId={getRowId}
          hideFooter
          disableRowSelectionOnClick
          density="comfortable"
          autoHeight
          loading={isLoading}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) => {
            console.error('Row update error:', error);
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              lineHeight: '1.5',
              py: 1,
            },
          }}
        />
      </Box>

      {/* 수정 모드 액션 버튼들 */}
      <DetailEditActions
        open={isEditMode}
        onSave={handleSaveClick}
        onCancel={handleCancelEdit}
        size={size}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default DataDetail;
