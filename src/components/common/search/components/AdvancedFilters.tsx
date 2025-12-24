import React, { memo, useMemo } from 'react';
import Box from '@mui/material/Box';
import type { SearchField } from '@/types/types';
import SearchSelect from '@/components/common/select/SearchSelect';
import SearchRadio from '@/components/common/radio/SearchRadio';
import SearchDateRangeInput from '@/components/common/input/SearchDateRangeInput';
import {
  getOriginalIndex,
  groupDateRangeFields,
  getDateFieldName,
  extractBaseField,
} from '../utils/searchFieldUtils';

type AdvancedFiltersProps = {
  searchFields: SearchField[];
  fieldValues: Record<string, string | number>;
  onFieldChange: (fieldKey: string, value: string | number) => void;
  size?: 'small' | 'medium' | 'large';
  inputStyles?: Record<string, unknown>;
};

const AdvancedFilters = memo(
  ({
    searchFields,
    fieldValues,
    onFieldChange,
    size = 'small',
    inputStyles,
  }: AdvancedFiltersProps) => {
    const advancedFilterFields = useMemo(
      () =>
        searchFields.filter(
          (sf) => sf.type === 'select' || sf.type === 'radio' || sf.type === 'dateRange',
        ),
      [searchFields],
    );

    const dateRangeGroups = useMemo(() => groupDateRangeFields(searchFields), [searchFields]);

    const muiSize = size === 'large' ? 'medium' : (size as 'small' | 'medium');

    if (advancedFilterFields.length === 0) {
      return null;
    }

    return (
      <Box display="flex" flexWrap="wrap" alignItems="center" rowGap={2}>
        {advancedFilterFields.map((sf) => {
          const originalIndex = getOriginalIndex(sf, searchFields);

          // dateRange 처리
          if (sf.type === 'dateRange') {
            const dateField = getDateFieldName(sf);
            const baseField = extractBaseField(dateField);
            const group = dateRangeGroups[baseField];

            if (sf.position === 'start' && group.start && group.end) {
              const startField = group.start;
              const endField = group.end;
              const startDateField = getDateFieldName(startField);
              const endDateField = getDateFieldName(endField);

              return (
                <SearchDateRangeInput
                  key={`dateRange_row_${baseField}`}
                  startLabel={startField.label}
                  endLabel={endField.label}
                  startValue={fieldValues[`${startDateField}_start`] || ''}
                  endValue={fieldValues[`${endDateField}_end`] || ''}
                  onStartChange={(value) => onFieldChange(`${startDateField}_start`, value)}
                  onEndChange={(value) => onFieldChange(`${endDateField}_end`, value)}
                  size="small"
                  inputStyles={inputStyles}
                />
              );
            }
            return null;
          }

          // select 타입
          if (sf.type === 'select') {
            const optionsWithAll = [{ label: '전체', value: '' }, ...(sf.options || [])];
            return (
              <SearchSelect
                key={sf.field}
                label={sf.label}
                value={fieldValues[sf.field] || ''}
                options={optionsWithAll}
                onChange={(val) => onFieldChange(sf.field, val)}
                size="small"
                sx={{ minWidth: '200px', marginRight: 2, ...inputStyles }}
                helperText={sf.helperText}
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
                onChange={(val) => onFieldChange(sf.field, val)}
                size={muiSize}
                sx={{ minWidth: '170px', ...inputStyles }}
              />
            );
          }

          return null;
        })}
      </Box>
    );
  },
);

AdvancedFilters.displayName = 'AdvancedFilters';

export default AdvancedFilters;
