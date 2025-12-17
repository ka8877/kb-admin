import { useMemo } from 'react';
import type { SearchField } from '@/types/types';
import { getOriginalIndex } from '../utils/searchFieldUtils';

/**
 * initialValues를 textGroup 형식으로 정규화하는 훅
 */
export const useSearchFieldNormalization = (
  searchFields: SearchField[] | undefined,
  initialValues: Record<string, string | number>,
) => {
  return useMemo(() => {
    const normalized: Record<string, string | number> = { ...initialValues };
    const textGroupSelected: Record<string, string> = {};

    (searchFields ?? []).forEach((sf) => {
      if (sf.type === 'textGroup') {
        const originalIndex = getOriginalIndex(sf, searchFields ?? []);
        sf.fields.forEach((field) => {
          if (
            initialValues[field.field] !== undefined &&
            initialValues[field.field] !== null &&
            initialValues[field.field] !== ''
          ) {
            normalized[`textGroup_${originalIndex}`] = initialValues[field.field];
            textGroupSelected[originalIndex.toString()] = field.field;
            delete normalized[field.field];
          }
        });
      }
    });

    return { normalized, textGroupSelected };
  }, [initialValues, searchFields]);
};

