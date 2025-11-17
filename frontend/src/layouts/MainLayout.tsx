import { PropsWithChildren, Fragment } from 'react';
import { Box, Container, Toolbar, Avatar, Stack, Typography } from '@mui/material';
import AppHeader from '../components/layout/AppHeader';
import GlobalLoadingSpinner from '../components/common/spinner/GlobalLoadingSpinner';
import SideNav from '../components/layout/SideNav';
import { DRAWER_WIDTH } from '../constants';
import { frontMenus, type MenuItem } from '../routes/menu';
import { useAuthStore } from '../store/auth';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }: PropsWithChildren) => {
  const user = useAuthStore((s) => s.user);
  const right = user ? (
    <Stack direction="row" spacing={1} alignItems="center">
      <Avatar sx={{ width: 28, height: 28 }}>{user.name?.charAt(0) || '?'}</Avatar>
      <Typography variant="body2" color="text.secondary">
        {user.name}
      </Typography>
    </Stack>
  ) : null;

  const { pathname } = useLocation();

  // Helper: find breadcrumb labels for current pathname by walking frontMenus
  const findBreadcrumb = (menus: MenuItem[], target: string): string[] => {
    const dfs = (list: MenuItem[], acc: string[]): string[] | null => {
      for (const m of list) {
        const nextAcc = [...acc, m.label];
        // treat prefix matches as belonging to the menu (e.g. /management/category/...)
        if (
          m.path === target ||
          (m.path !== '/' && target.startsWith(m.path + '/')) ||
          (m.path === '/' && target === '/')
        ) {
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

  const breadcrumb = findBreadcrumb(frontMenus, pathname);

  const activeTop = frontMenus.find((m) => {
    if (m.path === pathname) return true;
    if (pathname.startsWith(m.path === '/' ? '/' : m.path + '/')) return true;
    if (m.children) {
      const stack: MenuItem[] = [...m.children];
      while (stack.length) {
        const it = stack.pop();
        if (!it) break;
        if (it.path === pathname) return true;
        if (pathname.startsWith(it.path === '/' ? '/' : it.path + '/')) return true;
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

      {showSideNav && <SideNav drawerWidth={DRAWER_WIDTH} items={frontMenus} />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pl: '3rem',
          pr: '3rem',
          py: '3rem',
          width: showSideNav ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        }}
      >
        {/* push content below AppBar height */}
        <Toolbar />
        <Box sx={{ maxWidth: '100%', py: 0 }}>
          {/* Breadcrumb / 현재 페이지 설명 텍스트 */}
          {breadcrumb.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
