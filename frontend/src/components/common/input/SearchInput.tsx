import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SearchSelect from '../select/SearchSelect';
import MediumButton from '../button/MediumButton';
import { SearchFieldOption } from '@/types/types';


export type SearchInputProps = {
  label?: string;
  value: string;
  options: SearchFieldOption[];
  inputValue: string | number;
  onFieldChange: (field: string) => void;
  onInputChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  size?: 'small' | 'medium';
  sx?: Record<string, unknown>;
  inputStyles?: Record<string, unknown>;
};

const SearchInput: React.FC<SearchInputProps> = ({
  label = '검색대상',
  value,
  options,
  inputValue,
  onFieldChange,
  onInputChange,
  onSearch,
  placeholder = '검색어를 입력하세요',
  size = 'small',
  sx,
  inputStyles = {},
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1} width="100%" sx={sx}>
      <SearchSelect
        label={label}
        value={value}
        options={options}
        onChange={(val) => onFieldChange(val as string)}
        size={size}
        sx={{ minWidth: 140, ...inputStyles }}
      />

      <TextField
        size={size}
        placeholder={placeholder}
        value={String(inputValue)}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ flex: 1, ...inputStyles }}
      />

      <MediumButton
        variant="contained"
        onClick={onSearch}
        aria-label="검색"
        sx={{ minWidth: '70px', height: '40px', padding: '6px 14px' }}
      >
        검색
      </MediumButton>
    </Box>
  );
};

export default SearchInput;

