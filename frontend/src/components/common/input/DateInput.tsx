// frontend/src/components/common/input/DateInput.tsx
import React from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormHelperText, Box } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';

// 한국어 로케일 설정
dayjs.locale('ko');

export interface DateInputProps {
  /** 라벨 텍스트 */
  label: string;
  /** 선택된 날짜/시간 값 */
  value: Dayjs | null;
  /** 날짜/시간 변경 핸들러 */
  onChange: (value: Dayjs | null) => void;
  /** 에러 상태 */
  error?: boolean;
  /** 에러 메시지 */
  helperText?: string;
  /** 필수 필드 여부 */
  required?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** 최소 날짜/시간 */
  minDate?: Dayjs;
  /** 최대 날짜/시간 */
  maxDate?: Dayjs;
  /** 날짜/시간 형식 */
  format?: string;
  /** DateTimePicker 크기 */
  size?: 'small' | 'medium';
  /** DateTimePicker variant */
  variant?: 'outlined' | 'filled' | 'standard';
  /** 이름 속성 */
  name?: string;
  /** 읽기 전용 여부 */
  readOnly?: boolean;
  /** placeholder 텍스트 */
  placeholder?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  minDate,
  maxDate,
  format = 'YYYY-MM-DD HH:mm',
  size = 'medium',
  variant = 'outlined',
  name,
  readOnly = false,
  placeholder = '날짜와 시간을 선택하세요',
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
        <DateTimePicker
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          minDate={minDate}
          maxDate={maxDate}
          format={format}
          slotProps={{
            textField: {
              required,
              error,
              size,
              variant,
              name,
              fullWidth,
              placeholder,
            },
          }}
        />
        {helperText && (
          <FormHelperText error={error} sx={{ marginLeft: 1.75, marginTop: 0.5 }}>
            {helperText}
          </FormHelperText>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default DateInput;
