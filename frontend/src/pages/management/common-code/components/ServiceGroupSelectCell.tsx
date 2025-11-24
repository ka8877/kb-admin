import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { GridRenderEditCellParams } from '@mui/x-data-grid';

interface ServiceGroupSelectCellProps {
  params: GridRenderEditCellParams;
  options: string[];
  onUpdate: (newValue: string) => void;
}

const ServiceGroupSelectCell: React.FC<ServiceGroupSelectCellProps> = ({
  params,
  options,
  onUpdate,
}) => {
  const [inputValue, setInputValue] = useState<string>(params.value || '');
  const [selectedValue, setSelectedValue] = useState<string | null>(params.value || null);

  return (
    <Autocomplete<string, false, false, true>
      value={selectedValue}
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') {
          setSelectedValue(newValue);
          setInputValue(newValue);
          onUpdate(newValue);
        }
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(newInputValue);
        }
      }}
      options={options}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus
          placeholder="서비스 그룹 선택 또는 입력..."
          size="small"
          variant="standard"
        />
      )}
      sx={{ width: '100%' }}
    />
  );
};

export default ServiceGroupSelectCell;
