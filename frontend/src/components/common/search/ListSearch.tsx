import React, { useMemo, useCallback } from 'react';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import SearchSection from '@/components/layout/SearchSection';
import MediumButton from '../button/MediumButton';
import { SearchField } from '@/types/types';
import { useSearchFieldValues } from './hooks/useSearchFieldValues';
import TextGroupSearch from './components/TextGroupSearch';
import AdvancedFilters from './components/AdvancedFilters';

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
  const {
    fieldValues,
    resolvedTextGroupSelectedFields,
    updateFieldValue,
    updateTextGroupField,
    buildSearchPayload,
  } = useSearchFieldValues(searchFields, initialValues);

  // textGroup 필드 분리
  const textGroupFields = useMemo(
    () =>
      (searchFields ?? []).filter((sf) => sf.type === 'textGroup') as Extract<
        SearchField,
        { type: 'textGroup' }
      >[],
    [searchFields],
  );

  // 셀렉트박스와 텍스트필드 스타일 (버튼과 높이 맞춤)
  const inputStyles = useMemo(
    () => ({
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
    }),
    [],
  );

  // 검색 실행
  const handleSearch = useCallback(() => {
    const searchPayload = buildSearchPayload();
    onSearch(searchPayload);
  }, [buildSearchPayload, onSearch]);

  // textGroup 필드 변경 핸들러
  const handleTextGroupFieldChange = useCallback(
    (groupIndex: number, field: string) => {
      updateTextGroupField(groupIndex, field);
      updateFieldValue(`textGroup_${groupIndex}`, '');
    },
    [updateTextGroupField, updateFieldValue],
  );

  return (
    <SearchSection>
      <Box display="flex" flexDirection="column" gap={2}>
        {/* textGroup: full width로 상단에 배치 */}
        {textGroupFields.length > 0 && (
          <TextGroupSearch
            searchFields={textGroupFields}
            allSearchFields={searchFields ?? []}
            fieldValues={fieldValues}
            resolvedTextGroupSelectedFields={resolvedTextGroupSelectedFields}
            onFieldChange={handleTextGroupFieldChange}
            onInputChange={updateFieldValue}
            onSearch={handleSearch}
            placeholder={placeholder}
            inputStyles={inputStyles}
          />
        )}

        {/* 고급 필터: 회색 박스 안에 라벨:입력컴포넌트 형태로 배치 */}
        <AdvancedFilters
          searchFields={searchFields ?? []}
          fieldValues={fieldValues}
          onFieldChange={updateFieldValue}
          size={size}
          inputStyles={inputStyles}
        />

        {/* textGroup이 없을 때만 검색 버튼 표시 */}
        {textGroupFields.length === 0 && (
          <Box display="flex" justifyContent="flex-end">
            <MediumButton
              subType="etc"
              variant="contained"
              onClick={handleSearch}
              aria-label="검색"
              size="small"
            >
              검색
            </MediumButton>
          </Box>
        )}
      </Box>
    </SearchSection>
  );
};

export default ListSearch;
