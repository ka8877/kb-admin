// frontend/src/components/common/input/GroupedSelectInput.tsx
import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  ListSubheader,
} from '@mui/material';

export interface GroupedSelectOption {
  label: string;
  value: string | number;
}

export interface SelectOptionGroup {
  groupLabel: string;
  groupValue: string;
  options: GroupedSelectOption[];
}

export interface GroupedSelectInputProps {
  /** 라벨 텍스트 */
  label: string;
  /** 선택된 값 */
  value: string | number;
  /** 그룹화된 옵션 배열 */
  optionGroups: SelectOptionGroup[];
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
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** placeholder 텍스트 */
  placeholder?: string;
  /** Select 크기 */
  size?: 'small' | 'medium';
  /** Select variant */
  variant?: 'outlined' | 'filled' | 'standard';
  /** 이름 속성 */
  name?: string;
}

const GroupedSelectInput: React.FC<GroupedSelectInputProps> = ({
  label,
  value,
  optionGroups,
  onChange,
  error = false,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  placeholder = '선택',
  size = 'medium',
  variant = 'outlined',
  name,
}) => {
  const handleChange = (event: SelectChangeEvent<string | number>) => {
    onChange(event.target.value);
  };

  // required일 때 label에 * 추가
  const displayLabel = required ? `${label} *` : label;

  return (
    <FormControl
      required={required}
      fullWidth={fullWidth}
      error={error}
      disabled={disabled}
      size={size}
      variant={variant}
    >
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={displayLabel} onChange={handleChange} name={name}>
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>
        {optionGroups.map((group, groupIndex) => [
          <ListSubheader
            key={`group-${groupIndex}`}
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            {group.groupLabel}
          </ListSubheader>,
          ...group.options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{ paddingLeft: 4 }} // 그룹 아이템들을 들여쓰기
            >
              {option.label}
            </MenuItem>
          )),
        ])}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default GroupedSelectInput;
