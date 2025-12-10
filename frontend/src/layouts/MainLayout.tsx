import { PropsWithChildren, Fragment, useEffect, useState } from 'react';
import { Box, Container, Toolbar, Avatar, Stack, Typography } from '@mui/material';
import AppHeader from '../components/layout/AppHeader';
import GlobalLoadingSpinner from '../components/common/spinner/GlobalLoadingSpinner';
import SideNav from '../components/layout/SideNav';
import { DRAWER_WIDTH } from '../constants';
import type { MenuItem } from '../routes/menu';
import { useAuthStore } from '../store/auth';
import { useLocation } from 'react-router-dom';
import { menuMockDb } from '@/mocks/menuDb';
import { buildMenuTree } from '@/utils/menuUtils';
import { useIsCurrentPath } from '@/hooks';
import { ROUTES } from '@/routes/menu';

const MainLayout = ({ children }: PropsWithChildren) => {
  const user = useAuthStore((s) => s.user);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const { pathname } = useLocation();
  const isLoginPage = useIsCurrentPath(ROUTES.LOGIN);

  useEffect(() => {
    const loadMenus = async () => {
      const menuItems = await menuMockDb.listAll();
      const tree = buildMenuTree(menuItems);
      setMenus(tree);
    };
    loadMenus();
  }, [pathname]); // pathname 변경 시마다 메뉴 다시 로드

  if (isLoginPage) {
    return <>{children}</>;
  }

  const right = user ? (
    <Stack direction="row" spacing={1} alignItems="center">
      <Avatar sx={{ width: 28, height: 28 }}>{user.name?.charAt(0) || '?'}</Avatar>
      <Typography variant="body2" color="text.secondary">
        {user.name}
      </Typography>
    </Stack>
  ) : null;

  // Helper: find breadcrumb labels for current pathname by walking frontMenus
  const findBreadcrumb = (menus: MenuItem[], target: string): string[] => {
    const dfs = (list: MenuItem[], acc: string[]): string[] | null => {
      for (const m of list) {
        const nextAcc = [...acc, m.label];
        // 홈('/') 경로는 정확히 일치할 때만
        if (m.path === '/' && target === '/') {
          return nextAcc;
        }
        // treat prefix matches as belonging to the menu (e.g. /management/category/...)
        if (m.path === target || (m.path !== '/' && target.startsWith(m.path + '/'))) {
          // try deeper children first
          if (m.children) {
            const child = dfs(m.children, nextAcc);
            if (child) return child;
          }
          return nextAcc;
        }
        if (m.children) {
          const child = dfs(m.children, nextAcc);
          if (child) return child;
        }
      }
      return null;
    };

    return dfs(menus, []) ?? [];
  };

  const breadcrumb = findBreadcrumb(menus, pathname);

  const activeTop = menus.find((m) => {
    // 홈(/) 경로는 정확히 일치할 때만
    if (m.path === '/') {
      return pathname === '/';
    }
    if (m.path === pathname) return true;
    if (pathname.startsWith(m.path + '/')) return true;
    if (m.children) {
      const stack: MenuItem[] = [...m.children];
      while (stack.length) {
        const it = stack.pop();
        if (!it) break;
        if (it.path === pathname) return true;
        if (it.path !== '/' && pathname.startsWith(it.path + '/')) return true;
        if (it.children) stack.push(...it.children);
      }
    }
    return false;
  });

  const showSideNav =
    pathname !== '/' &&
    !!activeTop &&
    Array.isArray(activeTop.children) &&
    activeTop.children.length > 0;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <GlobalLoadingSpinner />
      <AppHeader drawerWidth={DRAWER_WIDTH} right={right} />

      {showSideNav && <SideNav drawerWidth={DRAWER_WIDTH} items={activeTop ? [activeTop] : []} />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pl: '3rem',
          pr: '3rem',
          pt: '2rem',
          pb: '1rem',
          width: showSideNav ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        }}
      >
        {/* push content below AppBar height */}
        <Toolbar />
        <Box sx={{ maxWidth: '100%', py: 0 }}>
          {/* Breadcrumb / 현재 페이지 설명 텍스트 - 홈이 아닐 때만 표시 */}
          {breadcrumb.length > 0 && pathname !== '/' && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: '10px' }}>
              {breadcrumb.map((label, index) => {
                const isLast = index === breadcrumb.length - 1;
                return (
                  <Fragment key={index}>
                    {index > 0 && ' / '}
                    <Typography
                      component="span"
                      variant="body2"
                      color={isLast ? 'text.primary' : 'text.secondary'}
                      sx={{ fontWeight: isLast ? 600 : 400 }}
                    >
                      {label}
                    </Typography>
                  </Fragment>
                );
              })}
            </Typography>
          )}
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
