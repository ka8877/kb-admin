import React, { useState, useMemo, useRef } from 'react';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import SearchSection from '@/components/layout/SearchSection';
import SearchSelect from '../select/SearchSelect';
import SearchRadio from '../radio/SearchRadio';
import MediumButton from '../button/MediumButton';
import SearchInput from '../input/SearchInput';
import { SearchField } from '@/types/types';
import SearchDateRangeInput from '../input/SearchDateRangeInput';

export type ListSearchProps<T extends GridValidRowModel = GridValidRowModel> = {
  columns?: GridColDef<T>[];
  searchFields?: SearchField[];
  onSearch: (payload: Record<string, string | number>) => void;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  initialValues?: Record<string, string | number>;
};

const ListSearch = <T extends GridValidRowModel = GridValidRowModel>({
  columns = [],
  searchFields,
  onSearch,
  placeholder = '검색어를 입력하세요',
  size = 'small',
  initialValues = {},
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

  // initialValues를 textGroup 형식으로 변환하는 함수
  const normalizeInitialValues = useMemo(() => {
    const normalized: Record<string, string | number> = { ...initialValues };
    const textGroupSelected: Record<string, string> = {};

    // textGroup 필드 처리: 실제 필드명을 textGroup_${originalIndex} 형식으로 변환
    (searchFields ?? []).forEach((sf, index) => {
      if (sf.type === 'textGroup') {
        // 원본 인덱스 찾기
        const originalIndex = getOriginalIndex(sf);
        // textGroup의 각 필드명을 확인
        sf.fields.forEach((field) => {
          if (
            initialValues[field.field] !== undefined &&
            initialValues[field.field] !== null &&
            initialValues[field.field] !== ''
          ) {
            // 실제 필드명을 textGroup_${originalIndex} 형식으로 변환
            normalized[`textGroup_${originalIndex}`] = initialValues[field.field];
            // 선택된 필드 저장 (originalIndex 사용)
            textGroupSelected[originalIndex.toString()] = field.field;
            // 원본 필드명 제거 (중복 방지)
            delete normalized[field.field];
          }
        });
      }
    });

    return { normalized, textGroupSelected };
  }, [initialValues, searchFields]);

  // 이전 initialValues 추적
  const prevInitialValuesRef = useRef<string>(JSON.stringify(initialValues || {}));
  const isInitialMountRef = useRef<boolean>(true);

  // 사용자가 입력한 값 추적 (검색 버튼 클릭 후에도 유지)
  // 초기 마운트 시 normalized initialValues로 초기화
  const [userInputValues, setUserInputValues] = useState<Record<string, string | number>>(
    () => normalizeInitialValues.normalized || {},
  );

  // initialValues가 변경되었는지 확인
  const currentInitialValuesStr = JSON.stringify(initialValues || {});
  const initialValuesChanged = prevInitialValuesRef.current !== currentInitialValuesStr;

  // textGroup의 경우 선택된 필드 관리
  const [textGroupSelectedFields, setTextGroupSelectedFields] = useState<Record<string, string>>(
    {},
  );

  // textGroupSelectedFields: normalizeInitialValues의 textGroupSelected와 사용자 선택을 병합
  // normalizeInitialValues.textGroupSelected가 있으면 우선 사용, 없으면 사용자가 선택한 값 사용
  const resolvedTextGroupSelectedFields = useMemo(() => {
    // normalizeInitialValues에 textGroupSelected가 있으면 우선 사용
    if (Object.keys(normalizeInitialValues.textGroupSelected).length > 0) {
      return normalizeInitialValues.textGroupSelected;
    }
    // 사용자가 선택한 값이 있으면 사용
    return textGroupSelectedFields;
  }, [normalizeInitialValues.textGroupSelected, textGroupSelectedFields]);

  // normalizeInitialValues.textGroupSelected가 변경되면 textGroupSelectedFields 상태도 업데이트
  if (Object.keys(normalizeInitialValues.textGroupSelected).length > 0) {
    if (
      JSON.stringify(textGroupSelectedFields) !==
      JSON.stringify(normalizeInitialValues.textGroupSelected)
    ) {
      setTextGroupSelectedFields(normalizeInitialValues.textGroupSelected);
    }
  }

  // fieldValues: 사용자 입력값과 normalized initialValues를 병합 (사용자 입력이 우선)
  const fieldValues = useMemo(() => {
    const normalized = normalizeInitialValues.normalized;

    // 첫 마운트 시 normalized initialValues 사용
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevInitialValuesRef.current = currentInitialValuesStr;
      return normalized || {};
    }

    // initialValues가 변경되었을 때 (상세화면에서 돌아왔을 때)
    if (initialValuesChanged) {
      // normalized initialValues에 있는 값만 업데이트하고, 사용자가 입력한 다른 값은 유지
      const merged = { ...userInputValues };
      Object.keys(normalized).forEach((key) => {
        if (normalized[key] !== undefined && normalized[key] !== null && normalized[key] !== '') {
          merged[key] = normalized[key];
        }
      });
      prevInitialValuesRef.current = currentInitialValuesStr;
      // userInputValues도 업데이트 (다음 렌더링에서 사용)
      setUserInputValues(merged);
      return merged;
    }

    // 사용자 입력값이 있으면 우선 사용, 없으면 normalized initialValues 사용
    return Object.keys(userInputValues).length > 0 ? userInputValues : normalized || {};
  }, [userInputValues, normalizeInitialValues, currentInitialValuesStr, initialValuesChanged]);

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

  // 필드 값 업데이트 함수 (사용자 입력값에 저장)
  const updateFieldValue = (fieldKey: string, value: string | number) => {
    setUserInputValues((prev) => ({
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
        const originalIndex = getOriginalIndex(sf);
        const selectedField =
          resolvedTextGroupSelectedFields[originalIndex.toString()] || sf.fields[0]?.field || '';
        if (selectedField) {
          const value = fieldValues[`textGroup_${originalIndex}`] || '';
          if (value) {
            searchPayload[selectedField] = value;
          }
        }
      } else if (sf.type === 'dateRange') {
        // dateRange는 start/end를 하나의 필드로 처리
        // dataField가 있으면 dataField 사용, 없으면 field 사용
        const dateField = 'dataField' in sf && sf.dataField ? sf.dataField : sf.field;
        const startValue = fieldValues[`${dateField}_start`] || '';
        const endValue = fieldValues[`${dateField}_end`] || '';
        if (startValue || endValue) {
          if (startValue) searchPayload[`${dateField}_start`] = startValue;
          if (endValue) searchPayload[`${dateField}_end`] = endValue;
        }
      } else {
        // 일반 필드: 빈 문자열은 포함하지 않음
        const value = fieldValues[sf.field];
        if (value !== undefined && value !== null && value !== '') {
          searchPayload[sf.field] = value;
        }
      }
    });

    onSearch(searchPayload);
  };

  // dateRange 필드들을 그룹화
  const dateRangeGroups = useMemo(() => {
    type DateRangeField = Extract<SearchField, { type: 'dateRange' }>;
    const groups: Record<string, { start?: DateRangeField; end?: DateRangeField }> = {};
    (searchFields ?? []).forEach((sf) => {
      if (sf.type === 'dateRange') {
        // baseField는 dataField가 있으면 dataField를 기준으로, 없으면 field를 기준으로 계산 (그룹화용)
        const dateField = 'dataField' in sf && sf.dataField ? sf.dataField : sf.field;
        // baseField 생성: start_date, end_date -> date로 통일하기 위해 접두사/접미사 제거
        // 1. 먼저 접두사 패턴 제거: start_, end_, imp_start_, imp_end_ 등
        //    이렇게 하면 start_date -> date, end_date -> date, imp_start_date -> date, imp_end_date -> date
        let baseField = dateField.replace(/^(start_|end_|imp_start_|imp_end_)/, '');
        // 2. 접미사 패턴 제거: _start_date, _end_date, _start, _end, _date
        baseField = baseField.replace(/_start_date$|_end_date$|_start$|_end$|_date$/, '');
        // 3. 빈 문자열이면 'date'로 설정 (fallback) - 같은 그룹으로 묶기 위함
        if (!baseField) {
          baseField = 'date';
        }
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
    <SearchSection>
      <Box display="flex" flexDirection="column" gap={2}>
        {/* textGroup: full width로 상단에 배치 */}
        {textGroupFields.map((sf, index) => {
          const originalIndex = getOriginalIndex(sf);
          const selectedField =
            resolvedTextGroupSelectedFields[originalIndex.toString()] || sf.fields[0]?.field || '';
          const selectOptions = sf.fields.map((f) => ({ value: f.field, label: f.label }));
          return (
            <SearchInput
              key={`textGroup_${originalIndex}`}
              label="검색대상"
              value={selectedField}
              options={selectOptions}
              inputValue={fieldValues[`textGroup_${originalIndex}`] || ''}
              onFieldChange={(val) => {
                updateTextGroupField(originalIndex, val);
                updateFieldValue(`textGroup_${originalIndex}`, '');
              }}
              onInputChange={(value) => updateFieldValue(`textGroup_${originalIndex}`, value)}
              onSearch={handleSearch}
              placeholder={placeholder}
              size={'small'}
              inputStyles={inputStyles}
            />
          );
        })}

        {/* 고급 필터: 회색 박스 안에 라벨:입력컴포넌트 형태로 배치 */}
        {advancedFilterFields.length > 0 && (
          <Box display="flex" flexWrap="wrap" alignItems="center" rowGap={2}>
            {advancedFilterFields.map((sf, filterIndex) => {
              const originalIndex = getOriginalIndex(sf);

              // dateRange 처리
              if (sf.type === 'dateRange') {
                // baseField는 dataField가 있으면 dataField를 기준으로, 없으면 field를 기준으로 계산
                const dateField = 'dataField' in sf && sf.dataField ? sf.dataField : sf.field;
                // baseField 생성: start_date, end_date -> date로 통일하기 위해 접두사/접미사 제거
                // 1. 먼저 접두사 패턴 제거: start_, end_, imp_start_, imp_end_ 등
                //    이렇게 하면 start_date -> date, end_date -> date, imp_start_date -> date, imp_end_date -> date
                let baseField = dateField.replace(/^(start_|end_|imp_start_|imp_end_)/, '');
                // 2. 접미사 패턴 제거: _start_date, _end_date, _start, _end, _date
                baseField = baseField.replace(/_start_date$|_end_date$|_start$|_end$|_date$/, '');
                // 3. 빈 문자열이면 'date'로 설정 (fallback) - 같은 그룹으로 묶기 위함
                if (!baseField) {
                  baseField = 'date';
                }
                const group = dateRangeGroups[baseField];
                if (sf.position === 'start' && group.start && group.end) {
                  const startField = group.start;
                  const endField = group.end;
                  // dataField가 있으면 dataField 사용, 없으면 field 사용
                  const startDateField =
                    'dataField' in startField && startField.dataField
                      ? startField.dataField
                      : startField.field;
                  const endDateField =
                    'dataField' in endField && endField.dataField
                      ? endField.dataField
                      : endField.field;
                  return (
                    <SearchDateRangeInput
                      key={`dateRange_row_${baseField}`}
                      startLabel={startField.label}
                      endLabel={endField.label}
                      startValue={fieldValues[`${startDateField}_start`] || ''}
                      endValue={fieldValues[`${endDateField}_end`] || ''}
                      onStartChange={(value) => updateFieldValue(`${startDateField}_start`, value)}
                      onEndChange={(value) => updateFieldValue(`${endDateField}_end`, value)}
                      size={'small'}
                      inputStyles={inputStyles}
                    />
                  );
                }
                return null;
              }

              // select 타입
              if (sf.type === 'select') {
                // '전체' 옵션을 맨 앞에 추가
                const optionsWithAll = [
                  { label: '전체', value: '' },
                  ...(sf.options || []),
                ];
                return (
                  <SearchSelect
                    key={sf.field}
                    label={sf.label}
                    value={fieldValues[sf.field] || ''}
                    options={optionsWithAll}
                    onChange={(val) => updateFieldValue(sf.field, val)}
                    size={'small'}
                    sx={{ minWidth: '200px', marginRight: 2, ...inputStyles }}
                  />
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
                    sx={{ minWidth: '170px', ...inputStyles }}
                  />
                );
              }
              return null;
            })}
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
    </SearchSection>
  );
};

export default ListSearch;
