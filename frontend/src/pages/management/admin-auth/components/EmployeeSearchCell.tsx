// frontend/src/pages/management/admin-auth/components/EmployeeSearchCell.tsx
import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import { employeeMockDb, EmployeeInfo } from '@/mocks/employeeDb';

interface EmployeeSearchCellProps {
  value: string;
  onChange: (employee: EmployeeInfo | null) => void;
  onClose?: () => void;
}

const EmployeeSearchCell: React.FC<EmployeeSearchCellProps> = ({ value, onChange, onClose }) => {
  const [open, setOpen] = useState(true);
  const [options, setOptions] = useState<EmployeeInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const results = await employeeMockDb.search(inputValue);
      if (active) {
        setOptions(results);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [inputValue]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => {
        setOpen(false);
      }}
      value={options.find((opt) => opt.user_name === value) || null}
      onChange={(_, newValue) => {
        if (newValue) {
          onChange(newValue);
        }
        setOpen(false);
        if (onClose) {
          setTimeout(() => onClose(), 0);
        }
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      getOptionLabel={(option) => `${option.user_name} (${option.id})`}
      loading={loading}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {option.user_name} ({option.id})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.position} · {option.team_1st} / {option.team_2nd}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus
          placeholder="이름, ID, 직책으로 검색..."
          size="small"
          variant="standard"
        />
      )}
      sx={{ width: '100%' }}
    />
  );
};

export default EmployeeSearchCell;
