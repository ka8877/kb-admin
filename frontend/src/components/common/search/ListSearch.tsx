// ...existing code...

import React, { useState, useMemo } from 'react';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import SearchSelect from '../select/SearchSelect';
import TextField from '@mui/material/TextField';
import SearchRadio from '../radio/SearchRadio';
import MediumButton from '../button/MediumButton';

// SearchField 타입 정의
export type SearchFieldOption = {
  label: string;
  value: string | number;
};

export type SearchField =
  | {
      field: string;
      label: string;
      type: 'select';
      options: SearchFieldOption[];
    }
  | {
      field: string;
      label: string;
      type: 'radio';
      options: SearchFieldOption[];
    }
  | {
      field: string;
      label: string;
      type: 'text';
    }
  | {
      type: 'textGroup';
      fields: Array<{ field: string; label: string }>;
    }
  | {
      field: string;
      label: string;
      type: 'dateRange';
      position: 'start' | 'end';
    };

export type ListSearchProps<T extends GridValidRowModel = GridValidRowModel> = {
  columns?: GridColDef<T>[];
  searchFields?: SearchField[];
  onSearch: (payload: Record<string, string | number>) => void;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
};

const ListSearch = <T extends GridValidRowModel = GridValidRowModel>({
  columns = [],
  searchFields,
  onSearch,
  placeholder = '검색어를 입력하세요',
  size = 'small',
}: ListSearchProps<T>): JSX.Element => {
  // 원본 인덱스 찾기 함수
  const getOriginalIndex = (sf: SearchField) => {
    return (searchFields ?? []).findIndex((f) => {
      if (sf.type === 'dateRange' && f.type === 'dateRange') {
        return sf.field === f.field;
      }
      if (sf.type === 'textGroup' && f.type === 'textGroup') {
        return JSON.stringify(sf.fields) === JSON.stringify(f.fields);
      }
      if ('field' in sf && 'field' in f) {
        return sf.field === f.field;
      }
      return false;
    });
  };

  // textGroup 필드 분리
  const textGroupFields = useMemo(() => {
    return (searchFields ?? []).filter((sf) => sf.type === 'textGroup');
  }, [searchFields]);

  // 고급 필터 필드 분리 (select, radio, dateRange)
  const advancedFilterFields = useMemo(() => {
    return (searchFields ?? []).filter(
      (sf) => sf.type === 'select' || sf.type === 'radio' || sf.type === 'dateRange',
    );
  }, [searchFields]);

  // 각 필드별 값 관리
  const [fieldValues, setFieldValues] = useState<Record<string, string | number>>({});

  // textGroup의 경우 선택된 필드 관리
  const [textGroupSelectedFields, setTextGroupSelectedFields] = useState<Record<string, string>>(
    {},
  );

  // MUI에서 지원하는 사이즈로 매핑 ('large' -> 'medium')
  const muiSize = size === 'large' ? 'medium' : (size as 'small' | 'medium');

  // 셀렉트박스와 텍스트필드 스타일 (버튼과 높이 맞춤)
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      fontSize: '0.875rem',
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.875rem',
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      minHeight: 'unset',
    },
  };

  // 필드 값 업데이트 함수
  const updateFieldValue = (fieldKey: string, value: string | number) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  // textGroup 필드 선택 업데이트
  const updateTextGroupField = (groupIndex: number, field: string) => {
    setTextGroupSelectedFields((prev) => ({
      ...prev,
      [groupIndex.toString()]: field,
    }));
  };

  // 검색 실행
  const handleSearch = () => {
    const searchPayload: Record<string, string | number> = {};

    (searchFields ?? []).forEach((sf, index) => {
      if (sf.type === 'textGroup') {
        // textGroup의 경우 선택된 필드와 값을 조합
        const selectedField =
          textGroupSelectedFields[index.toString()] || sf.fields[0]?.field || '';
        if (selectedField) {
          const value = fieldValues[`textGroup_${index}`] || '';
          if (value) {
            searchPayload[selectedField] = value;
          }
        }
      } else if (sf.type === 'dateRange') {
        // dateRange는 start/end를 하나의 필드로 처리
        const dateRangeKey = `dateRange_${sf.field}`;
        const startValue = fieldValues[`${sf.field}_start`] || '';
        const endValue = fieldValues[`${sf.field}_end`] || '';
        if (startValue || endValue) {
          if (startValue) searchPayload[`${sf.field}_start`] = startValue;
          if (endValue) searchPayload[`${sf.field}_end`] = endValue;
        }
      } else {
        // 일반 필드
        const value = fieldValues[sf.field];
        if (value !== undefined && value !== '' && value !== null) {
          searchPayload[sf.field] = value;
        }
      }
    });

    onSearch(searchPayload);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  // dateRange 필드들을 그룹화
  const dateRangeGroups = useMemo(() => {
    type DateRangeField = Extract<SearchField, { type: 'dateRange' }>;
    const groups: Record<string, { start?: DateRangeField; end?: DateRangeField }> = {};
    (searchFields ?? []).forEach((sf) => {
      if (sf.type === 'dateRange') {
        const baseField = sf.field.replace(/_start$|_end$/, '');
        if (!groups[baseField]) {
          groups[baseField] = {};
        }
        if (sf.position === 'start') {
          groups[baseField].start = sf;
        } else if (sf.position === 'end') {
          groups[baseField].end = sf;
        }
      }
    });
    return groups;
  }, [searchFields]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* textGroup: full width로 상단에 배치 */}
      {textGroupFields.map((sf, index) => {
        const originalIndex = getOriginalIndex(sf);
        const selectedField =
          textGroupSelectedFields[originalIndex.toString()] || sf.fields[0]?.field || '';
        const selectOptions = sf.fields.map((f) => ({ value: f.field, label: f.label }));
        return (
          <Box
            key={`textGroup_${originalIndex}`}
            display="flex"
            alignItems="center"
            gap={1}
            width="100%"
          >
            <SearchSelect
              label="검색대상"
              value={selectedField}
              options={selectOptions}
              onChange={(val) => {
                updateTextGroupField(originalIndex, val as string);
                updateFieldValue(`textGroup_${originalIndex}`, '');
              }}
              size={muiSize}
              sx={{ minWidth: 140, ...inputStyles }}
            />

            <TextField
              size={'small'}
              placeholder={placeholder}
              value={fieldValues[`textGroup_${originalIndex}`] || ''}
              onChange={(e) => updateFieldValue(`textGroup_${originalIndex}`, e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{ flex: 1, ...inputStyles }}
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
      })}

      {/* 고급 필터: 회색 박스 안에 라벨:입력컴포넌트 형태로 배치 */}
      {advancedFilterFields.length > 0 && (
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box display="flex" flexWrap="wrap" alignItems="center">
            {advancedFilterFields.map((sf, filterIndex) => {
              const originalIndex = getOriginalIndex(sf);

              // dateRange 처리
              if (sf.type === 'dateRange') {
                const baseField = sf.field.replace(/_start$|_end$/, '');
                const group = dateRangeGroups[baseField];
                if (sf.position === 'start' && group.start && group.end) {
                  const startField = group.start;
                  const endField = group.end;
                  return (
                    <Box
                      key={`dateRange_${baseField}`}
                      display="flex"
                      alignItems="center"
                      gap={1}
                      width="100%"
                      sx={{ marginLeft: filterIndex === 0 ? 0 : 2 }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'text.primary',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {startField.label.split('시작')[0] || startField.label}:
                      </Box>
                      <TextField
                        size={muiSize}
                        type="datetime-local"
                        value={fieldValues[startField.field] || ''}
                        onChange={(e) => updateFieldValue(startField.field, e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: '200px', ...inputStyles }}
                      />
                      <span>~</span>
                      <TextField
                        size={muiSize}
                        type="datetime-local"
                        value={fieldValues[endField.field] || ''}
                        onChange={(e) => updateFieldValue(endField.field, e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: '200px', ...inputStyles }}
                      />
                    </Box>
                  );
                }
                return null;
              }

              // select 타입
              if (sf.type === 'select') {
                return (
                  <Box
                    key={sf.field}
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{ marginLeft: filterIndex === 0 ? 0 : 2 }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'text.primary',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sf.label}:
                    </Box>
                    <SearchSelect
                      label={sf.label}
                      value={fieldValues[sf.field] || ''}
                      options={sf.options}
                      onChange={(val) => updateFieldValue(sf.field, val)}
                      size={'small'}
                      sx={{ minWidth: '200px', ...inputStyles }}
                    />
                  </Box>
                );
              }

              // radio 타입
              if (sf.type === 'radio') {
                return (
                  <SearchRadio
                    key={sf.field}
                    label={sf.label}
                    value={fieldValues[sf.field] || ''}
                    options={sf.options}
                    onChange={(val) => updateFieldValue(sf.field, val)}
                    size={muiSize}
                    sx={{ width: '100%', marginLeft: 2 }}
                  />
                );
              }

              return null;
            })}
          </Box>
        </Box>
      )}

      {/* textGroup이 없을 때만 검색 버튼 표시 */}
      {textGroupFields.length === 0 && (
        <Box display="flex" justifyContent="flex-end">
          <MediumButton variant="contained" onClick={handleSearch} aria-label="검색" size="small">
            검색
          </MediumButton>
        </Box>
      )}
    </Box>
  );
};

export default ListSearch;
