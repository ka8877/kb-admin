import type React from 'react';
import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import { APP_TITLE } from '../../constants';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { frontMenus, type MenuItem } from '../../routes/menu';

// Global application top bar (앱 전역 헤더)

export type AppHeaderProps = {
  title?: string;
  drawerWidth?: number;
  right?: React.ReactNode;
};

const isPathUnderMenu = (menu: MenuItem, pathname: string): boolean => {
  if (menu.path === pathname) return true;
  if (menu.children) {
    for (const c of menu.children) {
      if (isPathUnderMenu(c, pathname)) return true;
    }
  }
  if (pathname.startsWith(menu.path === '/' ? '/' : menu.path + '/')) return true;
  return false;
};

const AppHeader: React.FC<AppHeaderProps> = ({ title = APP_TITLE, drawerWidth = 0, right }) => {
  const { pathname } = useLocation();

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
          }}
          aria-label="Go to home"
        >
          {title}
        </Typography>

        <Box sx={{ ml: 3, display: 'flex', gap: 1 }}>
          {frontMenus.map((m) => {
            const active = isPathUnderMenu(m, pathname);
            return (
              <Button
                key={m.path}
                component={RouterLink}
                to={m.path}
                color={active ? 'primary' : 'inherit'}
                size="small"
                sx={{ textTransform: 'none', fontWeight: active ? 700 : 500 }}
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
