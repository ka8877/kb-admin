import type React from 'react';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { APP_TITLE } from '../../constants';

// Global application top bar (앱 전역 헤더)
// - 항상 화면 최상단에 고정되어 사이드 네비게이션 위에 표시됩니다.
// - 배경은 흰색(배경지 종이색)이고, 하단에 구분선(border)이 있습니다.

export type AppHeaderProps = {
  title?: string;
  drawerWidth?: number;
  right?: React.ReactNode;
};

const AppHeader: React.FC<AppHeaderProps> = ({ title = APP_TITLE, drawerWidth = 0, right }) => {
  // drawerWidth는 API 호환성을 위해 남겨두지만, 헤더는 항상 최상단 전체 너비로 표시합니다.
  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1, // Drawer(사이드메뉴)보다 위로
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`, // 하단 경계선
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {right}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
