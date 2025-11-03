// ...existing code...
import React, { useEffect, useState } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export type ListSearchProps = {
  columns?: GridColDef<any>[];
  onSearch: (payload: { field?: string; query: string }) => void;
  placeholder?: string;
  defaultField?: string;
  defaultQuery?: string; // 초기 검색어
  size?: 'small' | 'medium';
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
      <FormControl size={size} sx={{ minWidth: 140 }}>
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
        size={size}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ flex: 1, minWidth: 200 }}
      />

      <Button variant="contained" size={size} onClick={handleSearch} aria-label="검색">
        검색
      </Button>
    </Box>
  );
};

export default ListSearch;
