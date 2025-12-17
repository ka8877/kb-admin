// 메뉴 데이터를 계층 구조로 변환하는 유틸리티
import type { MenuScreenItem } from '@/pages/management/menu/types';
import type { MenuItem } from '@/routes/menu';

/**
 * Mock DB의 평면 메뉴 데이터를 계층 구조로 변환
 */
export function buildMenuTree(menuItems: MenuScreenItem[]): MenuItem[] {
  // display_yn = 'Y'인 항목만 필터링
  const visibleItems = menuItems.filter((item) => item.display_yn === 'Y');

  // ID로 빠른 조회를 위한 맵
  const itemMap = new Map<string, MenuScreenItem>();
  visibleItems.forEach((item) => {
    itemMap.set(item.screen_id, item);
  });

  // 결과 트리
  const tree: MenuItem[] = [];
  const childrenMap = new Map<string, MenuItem[]>();

  // 각 항목을 MenuItem 형식으로 변환하고 부모-자식 관계 구성
  visibleItems.forEach((item) => {
    const menuItem: MenuItem = {
      label: item.screen_name,
      path: item.path,
    };

    if (!item.parent_screen_id) {
      // 최상위 메뉴 (depth 0)
      tree.push(menuItem);
      childrenMap.set(item.screen_id, []);
    } else {
      // 하위 메뉴
      if (!childrenMap.has(item.parent_screen_id)) {
        childrenMap.set(item.parent_screen_id, []);
      }
      childrenMap.get(item.parent_screen_id)!.push(menuItem);
      childrenMap.set(item.screen_id, []);
    }
  });

  // 자식 항목을 부모에 연결
  const attachChildren = (menuItem: MenuItem, screenId: string) => {
    const children = childrenMap.get(screenId);
    if (children && children.length > 0) {
      menuItem.children = children;
      // 재귀적으로 자식의 자식도 연결
      children.forEach((child) => {
        const childScreenItem = visibleItems.find((item) => item.path === child.path);
        if (childScreenItem) {
          attachChildren(child, childScreenItem.screen_id);
        }
      });
    }
  };

  // 트리의 각 노드에 자식 연결
  visibleItems.forEach((item) => {
    if (!item.parent_screen_id) {
      const menuItem = tree.find((m) => m.path === item.path);
      if (menuItem) {
        attachChildren(menuItem, item.screen_id);
      }
    }
  });

  // order 순으로 정렬
  const sortByOrder = (items: MenuItem[]) => {
    items.forEach((item) => {
      if (item.children) {
        sortByOrder(item.children);
      }
    });
    items.sort((a, b) => {
      const aItem = visibleItems.find((i) => i.path === a.path);
      const bItem = visibleItems.find((i) => i.path === b.path);
      return (aItem?.order || 0) - (bItem?.order || 0);
    });
  };

  sortByOrder(tree);

  return tree;
}

/**
 * depth 0 메뉴만 반환 (헤더용)
 */
export function getTopLevelMenus(menuItems: MenuScreenItem[]): MenuItem[] {
  return buildMenuTree(menuItems);
}
