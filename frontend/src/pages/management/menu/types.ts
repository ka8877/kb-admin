// 메뉴 관리 타입 정의 (ui_menu 테이블 기반)

export interface MenuItem {
  menu_id?: number; // Auto increment
  menu_code: string; // 메뉴 코드 (UK)
  menu_name: string; // 메뉴 명
  menu_path: string | null; // 라우트 경로
  parent_menu_code?: string | null; // 상위 메뉴 코드 (계층 구조를 위해 추가)
  depth?: number; // 깊이 (UI 표시용, 계산 필드)
  sort_order: number; // 정렬 순서
  is_active: number; // 사용 여부 (1: 활성, 0: 비활성)
  created_by?: number; // 생성자 ID
  created_at?: string; // 생성 시각
  updated_by?: number | null; // 수정자 ID
  updated_at?: string | null; // 수정 시각
  firebaseKey?: string; // Firebase key
}

export interface MenuItemDisplay extends MenuItem {
  no: number; // 화면 표시용 번호
}

// Firebase 저장용 타입
export interface MenuItemFirebase {
  menu_code: string;
  menu_name: string;
  menu_path: string | null;
  parent_menu_code: string | null;
  sort_order: number;
  is_active: number;
  created_by: number;
  created_at: string;
  updated_by: number | null;
  updated_at: string | null;
}
