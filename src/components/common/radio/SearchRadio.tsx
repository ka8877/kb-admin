import React from 'react';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import SearchLabelLayout from '@/components/layout/list/SearchLabelLayout';

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
}) => {
  // sx에서 marginRight를 추출하여 SearchLabelLayout에 전달
  const { marginRight, ...radioGroupSx } = sx as { marginRight?: number | string; [key: string]: unknown };
  
  return (
    <SearchLabelLayout label={label} >
      <RadioGroup
        row
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ display: 'flex', gap: 1, ...radioGroupSx }}
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
    </SearchLabelLayout>
  );
};

export default SearchRadio;
