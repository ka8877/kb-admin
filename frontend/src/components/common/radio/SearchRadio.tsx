import React from 'react';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';

export interface SearchRadioOption {
  label: string;
  value: string | number;
}

export interface SearchRadioProps {
  label: string;
  value: string | number;
  options: SearchRadioOption[];
  onChange: (value: string | number) => void;
  size?: 'small' | 'medium';
  sx?: object;
}

const SearchRadio: React.FC<SearchRadioProps> = ({
  label,
  value,
  options,
  onChange,
  size = 'small',
  sx = {},
}) => (
  <Box display="flex" alignItems="center" gap={1} sx={sx}>
    <Box
      component="span"
      sx={{
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'text.primary',
        whiteSpace: 'nowrap',
      }}
    >
      {label}:
    </Box>
    <RadioGroup
      row
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ display: 'flex', gap: 1 }}
    >
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio size={size} />}
          label={option.label}
          sx={{ margin: 0 }}
        />
      ))}
    </RadioGroup>
  </Box>
);

export default SearchRadio;
