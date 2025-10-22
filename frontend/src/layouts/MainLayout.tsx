import { PropsWithChildren } from 'react';
import { Box, Container, Toolbar } from '@mui/material';
import AppHeader from '../components/layout/AppHeader';
import SideNav from '../components/layout/SideNav';
import { topMenus } from '../routes/menu';

const drawerWidth = 220;

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader title="kakaobank AI" drawerWidth={drawerWidth} />

      <SideNav drawerWidth={drawerWidth} items={topMenus} />

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
