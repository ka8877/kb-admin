import type React from 'react';
import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { APP_TITLE } from '@/constants';
import type { MenuItem } from '@/routes/menu';
import { useEffect, useState } from 'react';
import { menuMockDb } from '@/mocks/menuDb';
import { buildMenuTree } from '@/utils/menuUtils';

// Global application top bar (앱 전역 헤더)

export type AppHeaderProps = {
  title?: string;
  drawerWidth?: number;
  right?: React.ReactNode;
};

const isPathUnderMenu = (menu: MenuItem, pathname: string): boolean => {
  // 홈('/') 경로는 정확히 일치할 때만
  if (menu.path === '/') {
    return pathname === '/';
  }
  if (menu.path === pathname) return true;
  if (menu.children) {
    for (const c of menu.children) {
      if (isPathUnderMenu(c, pathname)) return true;
    }
  }
  if (pathname.startsWith(menu.path + '/')) return true;
  return false;
};

const AppHeader: React.FC<AppHeaderProps> = ({ title = APP_TITLE, drawerWidth = 0, right }) => {
  const { pathname } = useLocation();
  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    const loadMenus = async () => {
      const menuItems = await menuMockDb.listAll();
      const tree = buildMenuTree(menuItems);
      setMenus(tree);
    };
    loadMenus();
  }, []);

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            fontWeight: 700,
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { opacity: 0.85 },
            cursor: 'pointer',
            pr: 6,
          }}
          aria-label="Go to home"
        >
          {title}
        </Typography>

        <Box sx={{ ml: 3, display: 'flex', gap: 1 }}>
          {menus.map((m) => {
            const active = isPathUnderMenu(m, pathname);
            return (
              <Button
                key={m.path}
                component={RouterLink}
                to={m.path}
                color={active ? 'primary' : 'inherit'}
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.9375rem', // 15px
                }}
              >
                {m.label}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ flexGrow: 1 }} />
        {right}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
