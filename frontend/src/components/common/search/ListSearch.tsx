// ...existing code...
import React, { useEffect, useState } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import MediumButton from '../button/MediumButton';

export type ListSearchProps = {
  columns?: GridColDef<any>[];
  onSearch: (payload: { field?: string; query: string }) => void;
  placeholder?: string;
  defaultField?: string;
  defaultQuery?: string; // 초기 검색어
  size?: 'small' | 'medium' | 'large';
};

const ListSearch: React.FC<ListSearchProps> = ({
  columns = [],
  onSearch,
  placeholder = '검색어를 입력하세요',
  defaultField = 'all',
  defaultQuery = '',
  size = 'small',
}) => {
  const [field, setField] = useState<string>(defaultField);
  const [query, setQuery] = useState<string>(defaultQuery);

  // MUI에서 지원하는 사이즈로 매핑 ('large' -> 'medium')
  const muiSize = size === 'large' ? 'medium' : (size as 'small' | 'medium');

  // 셀렉트박스와 텍스트필드 스타일 (버튼과 높이 맞춤)
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      height: '40px',
      fontSize: '0.875rem',
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.875rem',
    },
  };

  useEffect(() => {
    setField(defaultField);
  }, [defaultField]);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  const handleSearch = () => {
    onSearch({ field: field === 'all' ? undefined : field, query: query.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const availableOptions = [
    { field: 'all', label: '전체' },
    ...columns
      .filter((c) => typeof c.field === 'string' && String(c.field).length > 0)
      .map((c) => ({ field: String(c.field), label: c.headerName ?? String(c.field) })),
  ];

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <FormControl size={muiSize} sx={{ minWidth: 140, ...inputStyles }}>
        <InputLabel id="list-search-field-label">검색대상</InputLabel>
        <Select
          labelId="list-search-field-label"
          value={field}
          label="검색대상"
          onChange={(e) => setField(String(e.target.value))}
        >
          {availableOptions.map((opt) => (
            <MenuItem key={opt.field} value={opt.field}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size={muiSize}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ flex: 1, minWidth: 200, ...inputStyles }}
      />

      <MediumButton
        variant="contained"
        onClick={handleSearch}
        aria-label="검색"
        sx={{ minWidth: '70px', height: '40px', padding: '6px 14px' }}
      >
        검색
      </MediumButton>
    </Box>
  );
};

export default ListSearch;
