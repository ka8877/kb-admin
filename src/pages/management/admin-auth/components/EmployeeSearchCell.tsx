// frontend/src/pages/management/admin-auth/components/EmployeeSearchCell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import { employeeMockDb, EmployeeInfo } from '@/mocks/employeeDb';

interface EmployeeSearchCellProps {
  value: string;
  onChange: (employee: EmployeeInfo | null) => void;
  onClose?: () => void;
}

const EmployeeSearchCell: React.FC<EmployeeSearchCellProps> = ({ value, onChange, onClose }) => {
  const [options, setOptions] = useState<EmployeeInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [selectedValue, setSelectedValue] = useState<EmployeeInfo | null>(null);
  const initializedRef = useRef(false);
  const lastValueRef = useRef(value);

  // 초기 데이터 로드
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      employeeMockDb.search('').then((results) => {
        setOptions(results);
        // 초기 value에 해당하는 직원 찾기
        if (value) {
          const found = results.find((opt) => opt.user_name === value);
          if (found) {
            setSelectedValue(found);
            setInputValue(value);
          }
        }
      });
    }
  }, []);

  // value prop이 외부에서 변경되면 내부 상태도 업데이트
  useEffect(() => {
    if (value !== lastValueRef.current && options.length > 0) {
      lastValueRef.current = value;
      const found = options.find((opt) => opt.user_name === value);
      if (found) {
        setSelectedValue(found);
        setInputValue(value);
      } else if (!value) {
        setSelectedValue(null);
        setInputValue('');
      }
    }
  }, [value, options]);

  // 검색어가 변경될 때만 검색
  useEffect(() => {
    if (!initializedRef.current) return;

    let active = true;
    const timer = setTimeout(() => {
      (async () => {
        setLoading(true);
        const results = await employeeMockDb.search(inputValue);
        if (active) {
          setOptions(results);
          setLoading(false);
        }
      })();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue]);

  return (
    <Autocomplete<EmployeeInfo>
      value={selectedValue}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue === 'object') {
          setSelectedValue(newValue);
          setInputValue(newValue.user_name);
          onChange(newValue);
        }
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(newInputValue);
        }
      }}
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option.user_name;
      }}
      loading={loading}
      isOptionEqualToValue={(option, value) => option.id === value.id}
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
