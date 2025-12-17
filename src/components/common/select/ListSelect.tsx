import React, { useCallback, useRef, useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { GridRenderEditCellParams } from '@mui/x-data-grid';
import type { SelectFieldOption } from '@/types/types';

export type ListSelectProps = {
  params: GridRenderEditCellParams;
  options: SelectFieldOption[];
};

/**
 * DataGrid에서 사용하는 셀렉트 편집 컴포넌트
 * EditableList, ExcelPreviewList 등에서 공통으로 사용
 */
const ListSelect: React.FC<ListSelectProps> = ({ params, options }) => {
  const [open, setOpen] = useState(true);
  const committedRef = useRef(false);

  const handleChange = useCallback(
    async (event: SelectChangeEvent<string>) => {
      setOpen(false);
      committedRef.current = true;
      await params.api.setEditCellValue({
        id: params.id,
        field: params.field,
        value: event.target.value,
      });
      try {
        params.api.stopCellEditMode({
          id: params.id,
          field: params.field,
        });
      } catch (error) {
        console.debug('Cell not in edit mode:', error);
      }
    },
    [params],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    try {
      params.api.stopCellEditMode({
        id: params.id,
        field: params.field,
        ignoreModifications: !committedRef.current,
      });
    } catch (error) {
      console.debug('Cell not in edit mode:', error);
    }
    committedRef.current = false;
  }, [params]);

  return (
    <Select
      value={params.value ?? ''}
      onChange={handleChange}
      onClose={handleClose}
      open={open}
      fullWidth
      size="small"
      MenuProps={{
        PaperProps: {
          sx: {
            maxHeight: 240,
          },
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default ListSelect;
