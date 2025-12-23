import { useCallback } from 'react';

type Order = 'asc' | 'desc';

interface UseRowNumberParams {
  totalElements: number;
  page?: number;
  size?: number;
  order?: Order;
}

/**
 * 리스트의 No(순번)를 생성하는 훅
 * @param totalElements 전체 데이터 개수
 * @param page 현재 페이지 (0부터 시작) - 페이지별 상대 인덱스를 사용할 경우 필요
 * @param size 페이지 크기 - 페이지별 상대 인덱스를 사용할 경우 필요
 * @param order 정렬 순서 ('desc' | 'asc') - 기본값 'desc'
 */
export const useRowNumber = ({
  totalElements,
  page = 0,
  size = 20,
  order = 'desc',
}: UseRowNumberParams) => {
  /**
   * 순번을 반환하는 함수
   * @param index 행의 인덱스
   * @param isPageRelative 인덱스가 현재 페이지 기준인지 여부 (기본값: false - 전체 데이터 기준)
   */
  const getRowNumber = useCallback(
    (index: number, isPageRelative: boolean = false) => {
      const globalIndex = isPageRelative ? page * size + index : index;

      if (order === 'asc') {
        return globalIndex + 1;
      }

      return totalElements - globalIndex;
    },
    [totalElements, page, size, order],
  );

  return getRowNumber;
};
