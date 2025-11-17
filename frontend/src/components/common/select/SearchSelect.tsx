import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export interface SearchSelectOption {
  label: string;
  value: string | number;
}

export interface SearchSelectProps {
  label: string;
  value: string | number;
  options: SearchSelectOption[];
  onChange: (value: string | number) => void;
  size?: 'small' | 'medium';
  sx?: object;
  placeholder?: string;
}

const SearchSelect: React.FC<SearchSelectProps> = ({
  label,
  value,
  options,
  onChange,
  size = 'small',
  sx = {},
  placeholder,
}) => (
  <FormControl size={size} sx={{ minWidth: 200, ...sx }}>
    <InputLabel>{label}</InputLabel>
    <Select
      value={value}
      label={label}
      onChange={(e) => onChange(e.target.value)}
      displayEmpty={!!placeholder}
    >
      {placeholder && (
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>
      )}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default SearchSelect;
