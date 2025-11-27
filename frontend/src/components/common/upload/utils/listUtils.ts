import React from 'react';
import type { GridColDef, GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { formatDateForDisplay, formatDateForStorage, formatDateWithDots } from '@/utils/dateUtils';
import type { SelectFieldOption } from '@/types/types';

export type CreateProcessedColumnsOptions<T extends GridValidRowModel> = {
  columns: GridColDef<T>[];
  isEditMode?: boolean;
  readOnlyFields?: string[];
  selectFields?: Record<string, SelectFieldOption[]>;
  dateFields?: string[];
  dateFormat?: string;
  /**
   * (선택) 날짜 표시 형식 (기본: YYYY-MM-DD HH:mm)
   * 'dots'로 설정하면 YYYY.MM.DD.HH:mm:ss 형식으로 표시
   */
  dateDisplayFormat?: 'default' | 'dots';
  /**
   * (선택) 행별로 특정 필드 옵션을 동적으로 지정할 때 사용 (row: T) => 옵션 배열
   * EditableList에서만 사용
   */
  getDynamicSelectOptions?: (row: T) => SelectFieldOption[];
  /**
   * (선택) 동적 옵션을 적용할 필드 목록 (기본: ['qst_ctgr'])
   * EditableList에서만 사용
   */
  dynamicSelectFields?: string[];
  /**
   * (선택) 행 업데이트 시 사용할 데이터/rowId
   * dynamicSelectFields + getDynamicSelectOptions 에서만 사용
   */
  data?: T[];
  getRowId?: (row: T) => string | number;
  /**
   * (선택) 셀렉트 에디트 셀 렌더러
   * EditableList에서만 전달
   */
  renderSelectEditCell?: (
    params: GridRenderEditCellParams,
    options: SelectFieldOption[],
  ) => React.ReactNode;
  /**
   * (선택) 필수 필드 목록 및 헤더에 * 표시 여부
   * 헤더 * 표시는 EditableList에서만 사용
   */
  requiredFields?: string[];
  addRequiredMark?: boolean;
};

export const createProcessedColumns = <T extends GridValidRowModel>({
  columns,
  isEditMode = false,
  readOnlyFields = [],
  selectFields,
  dateFields,
  dateFormat = 'YYYYMMDDHHmmss',
  dateDisplayFormat = 'default',
  getDynamicSelectOptions,
  dynamicSelectFields = ['qst_ctgr'],
  data,
  getRowId,
  renderSelectEditCell,
  requiredFields = [],
  addRequiredMark = false,
}: CreateProcessedColumnsOptions<T>): GridColDef<T>[] => {
  return columns.map((col) => {
    const isSelectField = selectFields && selectFields[col.field];
    const isDateField = dateFields && dateFields.includes(col.field);
    const isDynamicSelectField = dynamicSelectFields.includes(col.field);

    // 필수 필드인 경우 (EditableList에서만 headerName에 * 추가)
    const isRequired = requiredFields.includes(col.field);
    const headerName =
      addRequiredMark && isRequired && col.headerName ? `${col.headerName} *` : col.headerName;

    // 날짜 필드인 경우
    if (isDateField) {
      return {
        ...col,
        headerName,
        editable: isEditMode && !readOnlyFields.includes(col.field),
        valueFormatter: (params: { value: string }) => {
          if (dateDisplayFormat === 'dots') {
            return formatDateWithDots(params.value);
          }
          return formatDateForDisplay(params.value, dateFormat);
        },
        renderEditCell: (params: GridRenderEditCellParams) => {
          const DateEditCell = () => {
            const [open, setOpen] = React.useState(false);

            // 셀에 포커스가 오면 달력 자동 열기
            React.useEffect(() => {
              const timer = setTimeout(() => {
                setOpen(true);
              }, 100);
              return () => clearTimeout(timer);
            }, []);

            const handleDateChange = (value: unknown) => {
              const newValue = value as dayjs.Dayjs | null;
              const dateObj = newValue ? newValue.toDate() : null;
              const formattedValue = formatDateForStorage(dateObj, dateFormat);
              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: formattedValue,
              });
            };

            const currentValue = params.value ? dayjs(params.value, dateFormat) : null;

            return React.createElement(
              LocalizationProvider,
              { dateAdapter: AdapterDayjs },
              React.createElement(DateTimePicker, {
                value: currentValue,
                onChange: handleDateChange,
                open: open,
                onOpen: () => setOpen(true),
                onClose: () => setOpen(false),
                format: 'YYYY-MM-DD HH:mm',
                slotProps: {
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    autoFocus: true,
                    onKeyDown: (e: React.KeyboardEvent) => {
                      // Tab 키는 상위에서 처리하도록 전파
                      if (e.key === 'Tab') {
                        e.stopPropagation();
                      }
                      // Enter 키를 누르면 달력 열기/닫기 토글
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen((prev) => !prev);
                      }
                    },
                  },
                },
              }),
            );
          };

          return React.createElement(DateEditCell);
        },
      };
    }

    // 동적 셀렉트 필드: 편집 모드에서 행별로 옵션 다르게 (EditableList 전용)
    if (
      isDynamicSelectField &&
      isEditMode &&
      typeof getDynamicSelectOptions === 'function' &&
      data &&
      getRowId &&
      renderSelectEditCell
    ) {
      return {
        ...col,
        headerName,
        type: 'singleSelect',
        valueOptions: (params: GridRenderEditCellParams) => {
          const row = data.find((r) => getRowId(r) === params.id);
          return row ? getDynamicSelectOptions(row) : [];
        },
        editable: isEditMode && !readOnlyFields.includes(col.field),
        renderEditCell: (params: GridRenderEditCellParams) => {
          const row = data.find((r) => getRowId(r) === params.id);
          const options = row ? getDynamicSelectOptions(row) : [];
          return renderSelectEditCell(params, options);
        },
      };
    }

    // 셀렉트 필드인 경우
    if (isSelectField) {
      return {
        ...col,
        headerName,
        type: 'singleSelect',
        valueOptions: isSelectField.map((opt) => ({
          value: opt.value,
          label: opt.label,
        })),
        editable: isEditMode && !readOnlyFields.includes(col.field),
        renderEditCell:
          renderSelectEditCell && isEditMode
            ? (params: GridRenderEditCellParams) => renderSelectEditCell(params, isSelectField)
            : col.renderEditCell,
      };
    }

    // 일반 필드
    return {
      ...col,
      headerName,
      editable: isEditMode && !readOnlyFields.includes(col.field),
    };
  });
};
