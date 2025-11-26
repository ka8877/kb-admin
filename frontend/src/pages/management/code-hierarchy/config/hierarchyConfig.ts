// frontend/src/pages/management/code-hierarchy/config/hierarchyConfig.ts
import type { HierarchyDefinition } from '../types';

/**
 * 계층 구조 설정
 * 새로운 계층 관계를 추가하려면 여기에 정의를 추가하세요
 */
export const HIERARCHY_DEFINITIONS: HierarchyDefinition[] = [
  {
    id: 'service-question',
    parentType: 'SERVICE_NAME',
    parentLabel: '서비스명',
    childType: 'QUESTION_CATEGORY',
    childLabel: '질문 카테고리',
    relationField: 'parent_service_cd',
  },
  // 향후 추가 예시:
  // {
  //   id: 'region-branch',
  //   parentType: 'REGION',
  //   parentLabel: '지역',
  //   childType: 'BRANCH',
  //   childLabel: '지점',
  //   relationField: 'parent_region_cd',
  // },
  // {
  //   id: 'category-product',
  //   parentType: 'PRODUCT_CATEGORY',
  //   parentLabel: '상품 카테고리',
  //   childType: 'PRODUCT',
  //   childLabel: '상품',
  //   relationField: 'parent_category_cd',
  // },
];

/**
 * 계층 구조 ID로 정의 찾기
 */
export const getHierarchyDefinition = (id: string): HierarchyDefinition | undefined => {
  return HIERARCHY_DEFINITIONS.find((def) => def.id === id);
};

/**
 * 부모 타입으로 계층 구조 찾기
 */
export const getHierarchyByParentType = (parentType: string): HierarchyDefinition | undefined => {
  return HIERARCHY_DEFINITIONS.find((def) => def.parentType === parentType);
};

/**
 * 자식 타입으로 계층 구조 찾기
 */
export const getHierarchyByChildType = (childType: string): HierarchyDefinition | undefined => {
  return HIERARCHY_DEFINITIONS.find((def) => def.childType === childType);
};
