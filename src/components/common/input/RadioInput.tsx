// frontend/src/components/common/input/RadioInput.tsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material';

export interface RadioOption {
  label: string;
  value: string | number;
}

export interface RadioInputProps {
  /** 라벨 텍스트 */
  label: string;
  /** 선택된 값 */
  value: string | number;
  /** 옵션 배열 */
  options: RadioOption[];
  /** 값 변경 핸들러 */
  onChange: (value: string | number) => void;
  /** 에러 상태 */
  error?: boolean;
  /** 에러 메시지 */
  helperText?: string;
  /** 필수 필드 여부 */
  required?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 라디오 버튼 방향 */
  row?: boolean;
  /** RadioGroup 크기 */
  size?: 'small' | 'medium';
  /** 이름 속성 */
  name?: string;
  /** 색상 */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const RadioInput: React.FC<RadioInputProps> = ({
  label,
  value,
  options,
  onChange,
  error = false,
  helperText,
  required = false,
  disabled = false,
  row = false,
  size = 'medium',
  name,
  color = 'primary',
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl error={error} disabled={disabled} required={required}>
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup value={value} onChange={handleChange} row={row} name={name}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio size={size} color={color} />}
            label={option.label}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default RadioInput;
