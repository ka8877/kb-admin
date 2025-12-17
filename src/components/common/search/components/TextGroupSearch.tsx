import React, { memo } from 'react';
import type { SearchField } from '@/types/types';
import SearchInput from '@/components/common/input/SearchInput';
import { getOriginalIndex } from '../utils/searchFieldUtils';

type TextGroupSearchProps = {
  searchFields: Extract<SearchField, { type: 'textGroup' }>[];
  allSearchFields: SearchField[];
  fieldValues: Record<string, string | number>;
  resolvedTextGroupSelectedFields: Record<string, string>;
  onFieldChange: (groupIndex: number, field: string) => void;
  onInputChange: (fieldKey: string, value: string | number) => void;
  onSearch: () => void;
  placeholder?: string;
  inputStyles?: Record<string, unknown>;
};

const TextGroupSearch = memo(
  ({
    searchFields,
    allSearchFields,
    fieldValues,
    resolvedTextGroupSelectedFields,
    onFieldChange,
    onInputChange,
    onSearch,
    placeholder = '검색어를 입력하세요',
    inputStyles,
  }: TextGroupSearchProps) => {
    return (
      <>
        {searchFields.map((sf) => {
          const originalIndex = getOriginalIndex(sf, allSearchFields);
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
                onFieldChange(originalIndex, val);
                onInputChange(`textGroup_${originalIndex}`, '');
              }}
              onInputChange={(value) => onInputChange(`textGroup_${originalIndex}`, value)}
              onSearch={onSearch}
              placeholder={placeholder}
              size="small"
              inputStyles={inputStyles}
            />
          );
        })}
      </>
    );
  },
);

TextGroupSearch.displayName = 'TextGroupSearch';

export default TextGroupSearch;
