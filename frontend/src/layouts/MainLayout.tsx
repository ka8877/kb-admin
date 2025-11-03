import { PropsWithChildren } from 'react';
import { Box, Container, Toolbar, Avatar, Stack, Typography } from '@mui/material';
import AppHeader from '../components/layout/AppHeader';
import GlobalLoadingSpinner from '../components/common/spinner/GlobalLoadingSpinner';
import SideNav from '../components/layout/SideNav';
import { DRAWER_WIDTH } from '../constants';
import { frontMenus } from '../routes/menu';
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

  const activeTop = frontMenus.find((m) => {
    if (m.path === pathname) return true;
    if (pathname.startsWith(m.path === '/' ? '/' : m.path + '/')) return true;
    if (m.children) {
      const stack: typeof m.children = [...m.children];
      while (stack.length) {
        const it = stack.pop() as any;
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

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* push content below AppBar height */}
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
