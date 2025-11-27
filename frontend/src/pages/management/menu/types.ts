// frontend/src/pages/management/menu/types.ts

/**
 * 메뉴 관리 타입 정의
 */

export type MenuScreenItem = {
  id: string | number;
  screen_id: string; // 화면 ID
  screen_name: string; // 화면명
  path: string; // PATH
  depth: number; // DEPTH
  order: number; // 순서
  parent_screen_id?: string; // 상위화면 ID
  screen_type: '메뉴' | '페이지' | '기능'; // 화면타입
  display_yn: 'Y' | 'N'; // 표시여부
  created_at?: string;
  updated_at?: string;
};

export type RowItem = MenuScreenItem & {
  no: number; // 화면 표시용 번호
};
