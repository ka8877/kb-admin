import { useCallback, useMemo } from 'react';
import type { GridValidRowModel, GridColDef } from '@mui/x-data-grid';
import type { ValidationResult } from '@/types/types';
import { hasDataChanges } from '@/utils/dataUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { toast } from 'react-toastify';
import {
  CONFIRM_TITLES,
  CONFIRM_MESSAGES,
  TOAST_MESSAGES,
  ALERT_TITLES,
} from '@/constants/message';

type UseDataDetailValidationParams<T> = {
  data: T | undefined;
  editedData: T | undefined;
  columns: GridColDef<T>[];
  validator?: (data: T) => Record<string, ValidationResult>;
  checkChangesBeforeSave: boolean;
  excludeFieldsFromChangeCheck: string[];
  onSave?: (updatedData: T) => Promise<void> | void;
  setIsEditMode: (value: boolean) => void;
  setHasInitialFocus: (value: boolean) => void;
  tabKeyPressedRef: React.MutableRefObject<{ field: string; rowId: string | number } | null>;
  shouldMoveToNextCellRef: React.MutableRefObject<boolean>;
};

/**
 * DataDetail 컴포넌트의 검증 및 저장 처리 훅
 */
export const useDataDetailValidation = <T extends GridValidRowModel>({
  data,
  editedData,
  columns,
  validator,
  checkChangesBeforeSave,
  excludeFieldsFromChangeCheck,
  onSave,
  setIsEditMode,
  setHasInitialFocus,
  tabKeyPressedRef,
  shouldMoveToNextCellRef,
}: UseDataDetailValidationParams<T>) => {
  const { showAlert } = useAlertDialog();
  const { showConfirm } = useConfirmDialog();

  const handleSaveClick = useCallback(() => {
    // 변경사항 체크
    if (checkChangesBeforeSave && editedData && data) {
      const hasChanges = hasDataChanges(data, editedData, excludeFieldsFromChangeCheck);
      if (!hasChanges) {
        showAlert({
          title: ALERT_TITLES.VALIDATION_CHECK,
          message: '변경된 내용이 없습니다.',
          severity: 'warning',
        });
        return;
      }
    }

    // Validation 체크
    if (validator && editedData) {
      const validationResults = validator(editedData);

      for (const col of columns) {
        const fieldName = col.field;
        const result = validationResults[fieldName];

        if (result && !result.isValid) {
          const errorMessage = `1행: ${result.message}`;
          showAlert({
            title: ALERT_TITLES.VALIDATION_CHECK,
            message: errorMessage,
            severity: 'error',
          });
          return;
        }
      }
    }

    showConfirm({
      title: CONFIRM_TITLES.SAVE,
      message: CONFIRM_MESSAGES.SAVE_CHANGES,
      onConfirm: () => {
        const executeSave = async () => {
          if (editedData && onSave) {
            try {
              await onSave(editedData);
              toast.success(TOAST_MESSAGES.SAVE_SUCCESS);
              setIsEditMode(false);
              setHasInitialFocus(false);
              tabKeyPressedRef.current = null;
              shouldMoveToNextCellRef.current = false;
            } catch (error) {
              toast.error(TOAST_MESSAGES.UPDATE_FAILED);
              console.error('저장 실패:', error);
            }
          }
        };
        executeSave();
      },
    });
  }, [
    checkChangesBeforeSave,
    editedData,
    data,
    excludeFieldsFromChangeCheck,
    validator,
    columns,
    showAlert,
    showConfirm,
    onSave,
    setIsEditMode,
    setHasInitialFocus,
    tabKeyPressedRef,
    shouldMoveToNextCellRef,
  ]);

  return { handleSaveClick };
};
