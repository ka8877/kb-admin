import React from 'react';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export type SearchDateRangeInputProps = {
  startLabel: string;
  endLabel: string;
  startValue: string | number;
  endValue: string | number;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  size?: 'small' | 'medium';
  inputStyles?: Record<string, unknown>;
  sx?: Record<string, unknown>;
};

const SearchDateRangeInput: React.FC<SearchDateRangeInputProps> = ({
  startLabel,
  endLabel,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  size = 'small',
  inputStyles = {},
  sx,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={1} flexShrink={0} sx={sx}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            component="span"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.primary',
              whiteSpace: 'nowrap',
            }}
          >
            {startLabel.split('시작')[0] || startLabel}:
          </Box>
          <DatePicker
            label={startLabel}
            value={startValue ? dayjs(String(startValue)) : null}
            onChange={(newValue) => {
              onStartChange(newValue ? newValue.format('YYYY-MM-DD') : '');
            }}
            slotProps={{
              textField: {
                size: size,
                sx: {
                  minWidth: '120px',
                  maxWidth: '140px',
                  marginRight: 1,
                  ...inputStyles,
                },
              },
            }}
          />
          <span>~</span>
          <DatePicker
            label={endLabel}
            value={endValue ? dayjs(String(endValue)) : null}
            onChange={(newValue) => {
              onEndChange(newValue ? newValue.format('YYYY-MM-DD') : '');
            }}
            slotProps={{
              textField: {
                size: size,
                sx: {
                  minWidth: '120px',
                  maxWidth: '140px',
                  marginRight: 1,
                  ...inputStyles,
                },
              },
            }}
          />
        </Box>
      </LocalizationProvider>
    </Box>
  );
};

export default SearchDateRangeInput;

