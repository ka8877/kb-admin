import { useState, useMemo, useRef, useCallback } from 'react';
import type { SearchField } from '@/types/types';
import { useSearchFieldNormalization } from './useSearchFieldNormalization';
import { getOriginalIndex, getDateFieldName, extractBaseField } from '../utils/searchFieldUtils';

/**
 * 검색 필드 값 관리 훅
 */
export const useSearchFieldValues = (
  searchFields: SearchField[] | undefined,
  initialValues: Record<string, string | number>,
) => {
  const normalizeResult = useSearchFieldNormalization(searchFields, initialValues);
  const prevInitialValuesRef = useRef<string>(JSON.stringify(initialValues || {}));
  const isInitialMountRef = useRef<boolean>(true);

  const [userInputValues, setUserInputValues] = useState<Record<string, string | number>>(
    () => normalizeResult.normalized || {},
  );

  const [textGroupSelectedFields, setTextGroupSelectedFields] = useState<Record<string, string>>(
    {},
  );

  // initialValues 변경 감지
  const currentInitialValuesStr = JSON.stringify(initialValues || {});
  const initialValuesChanged = prevInitialValuesRef.current !== currentInitialValuesStr;

  // textGroupSelectedFields 병합
  const resolvedTextGroupSelectedFields = useMemo(() => {
    if (Object.keys(normalizeResult.textGroupSelected).length > 0) {
      return normalizeResult.textGroupSelected;
    }
    return textGroupSelectedFields;
  }, [normalizeResult.textGroupSelected, textGroupSelectedFields]);

  // normalizeResult.textGroupSelected가 변경되면 상태 업데이트
  if (Object.keys(normalizeResult.textGroupSelected).length > 0) {
    if (
      JSON.stringify(textGroupSelectedFields) !== JSON.stringify(normalizeResult.textGroupSelected)
    ) {
      setTextGroupSelectedFields(normalizeResult.textGroupSelected);
    }
  }

  // fieldValues 계산
  const fieldValues = useMemo(() => {
    const normalized = normalizeResult.normalized;

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevInitialValuesRef.current = currentInitialValuesStr;
      return normalized || {};
    }

    if (initialValuesChanged) {
      const merged = { ...userInputValues };
      Object.keys(normalized).forEach((key) => {
        if (normalized[key] !== undefined && normalized[key] !== null && normalized[key] !== '') {
          merged[key] = normalized[key];
        }
      });
      prevInitialValuesRef.current = currentInitialValuesStr;
      setUserInputValues(merged);
      return merged;
    }

    return Object.keys(userInputValues).length > 0 ? userInputValues : normalized || {};
  }, [userInputValues, normalizeResult, currentInitialValuesStr, initialValuesChanged]);

  // 필드 값 업데이트
  const updateFieldValue = useCallback((fieldKey: string, value: string | number) => {
    setUserInputValues((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  }, []);

  // textGroup 필드 선택 업데이트
  const updateTextGroupField = useCallback((groupIndex: number, field: string) => {
    setTextGroupSelectedFields((prev) => ({
      ...prev,
      [groupIndex.toString()]: field,
    }));
  }, []);

  // 검색 페이로드 생성
  const buildSearchPayload = useCallback((): Record<string, string | number> => {
    const searchPayload: Record<string, string | number> = {};

    (searchFields ?? []).forEach((sf) => {
      if (sf.type === 'textGroup') {
        const originalIndex = getOriginalIndex(sf, searchFields ?? []);
        const selectedField =
          resolvedTextGroupSelectedFields[originalIndex.toString()] || sf.fields[0]?.field || '';
        if (selectedField) {
          const value = fieldValues[`textGroup_${originalIndex}`] || '';
          if (value) {
            searchPayload[selectedField] = value;
          }
        }
      } else if (sf.type === 'dateRange') {
        const dateField = getDateFieldName(sf);
        const baseField = extractBaseField(dateField);

        if (sf.position === 'start') {
          const val = fieldValues[`${dateField}_start`];
          if (val) {
            const key = dateField === baseField ? `${dateField}_start` : dateField;
            searchPayload[key] = val;
          }
        } else if (sf.position === 'end') {
          const val = fieldValues[`${dateField}_end`];
          if (val) {
            const key = dateField === baseField ? `${dateField}_end` : dateField;
            searchPayload[key] = val;
          }
        }
      } else {
        const value = fieldValues[sf.field];
        if (value !== undefined && value !== null && value !== '') {
          searchPayload[sf.field] = value;
        }
      }
    });

    return searchPayload;
  }, [searchFields, resolvedTextGroupSelectedFields, fieldValues]);

  return {
    fieldValues,
    resolvedTextGroupSelectedFields,
    updateFieldValue,
    updateTextGroupField,
    buildSearchPayload,
  };
};
