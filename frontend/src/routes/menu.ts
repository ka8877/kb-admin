export type MenuItem = {
  label: string
  path: string
  icon?: string // placeholder for icon id or name
  children?: MenuItem[]
}

export const topMenus: MenuItem[] = [
  { label: '홈', path: '/' },
  { label: '대시보드', path: '/dashboard' },
]
