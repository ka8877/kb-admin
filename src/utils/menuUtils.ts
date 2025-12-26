// 메뉴 데이터를 계층 구조로 변환하는 유틸리티
import type { MenuItem as MenuItemType } from '@/pages/management/menu/types';
import type { MenuItem } from '@/routes/menu';

/**
 * Mock DB의 평면 메뉴 데이터를 계층 구조로 변환
 */
export const buildMenuTree = (menuItems: MenuItemType[]): MenuItem[] => {
  // isVisible = true인 항목만 필터링
  const visibleItems = menuItems.filter((item) => item.isVisible);

  // menuCode로 빠른 조회를 위한 맵
  const itemMap = new Map<string, MenuItemType>();
  visibleItems.forEach((item) => {
    itemMap.set(item.menuCode, item);
  });

  // 결과 트리
  const tree: MenuItem[] = [];
  const childrenMap = new Map<string, MenuItem[]>();

  // 각 항목을 MenuItem 형식으로 변환하고 부모-자식 관계 구성
  visibleItems.forEach((item) => {
    const menuItem: MenuItem = {
      label: item.menuName,
      path: item.menuPath || '',
    };

    if (!item.parentMenuCode) {
      // 최상위 메뉴
      tree.push(menuItem);
      childrenMap.set(item.menuCode, []);
    } else {
      // 하위 메뉴
      if (!childrenMap.has(item.parentMenuCode)) {
        childrenMap.set(item.parentMenuCode, []);
      }
      childrenMap.get(item.parentMenuCode)!.push(menuItem);
      childrenMap.set(item.menuCode, []);
    }
  });

  // 자식 항목을 부모에 연결
  const attachChildren = (menuItem: MenuItem, menuCode: string) => {
    const children = childrenMap.get(menuCode);
    if (children && children.length > 0) {
      menuItem.children = children;
      // 재귀적으로 자식의 자식도 연결
      children.forEach((child) => {
        const childMenuItem = visibleItems.find((item) => item.menuPath === child.path);
        if (childMenuItem) {
          attachChildren(child, childMenuItem.menuCode);
        }
      });
    }
  };

  // 트리의 각 노드에 자식 연결
  visibleItems.forEach((item) => {
    if (!item.parentMenuCode) {
      const menuItem = tree.find((m) => m.path === item.menuPath);
      if (menuItem) {
        attachChildren(menuItem, item.menuCode);
      }
    }
  });

  // sortOrder 순으로 정렬
  const sortByOrder = (items: MenuItem[]) => {
    items.forEach((item) => {
      if (item.children) {
        sortByOrder(item.children);
      }
    });
    items.sort((a, b) => {
      const aItem = visibleItems.find((i) => i.menuPath === a.path);
      const bItem = visibleItems.find((i) => i.menuPath === b.path);
      return (aItem?.sortOrder || 0) - (bItem?.sortOrder || 0);
    });
  };

  sortByOrder(tree);

  return tree;
};

/**
 * depth 1 메뉴만 반환 (최상위 메뉴)
 */
export const getTopLevelMenus = (menuItems: MenuItemType[]): MenuItem[] => {
  return buildMenuTree(menuItems);
};
