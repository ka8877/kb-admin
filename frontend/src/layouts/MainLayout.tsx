import { PropsWithChildren, useEffect } from 'react';
import { Box, Container, Toolbar } from '@mui/material';
import AppHeader from '../components/layout/AppHeader';
import SideNav from '../components/layout/SideNav';
import { useMenuStore } from '../store/menu';
import { DRAWER_WIDTH } from '../constants';

const MainLayout = ({ children }: PropsWithChildren) => {
  const menus = useMenuStore((s) => s.menus);
  const loadMenus = useMenuStore((s) => s.loadMenus);

  useEffect(() => {
    if (menus.length === 0) {
      loadMenus();
    }
  }, [menus.length, loadMenus]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader drawerWidth={DRAWER_WIDTH} />

      <SideNav drawerWidth={DRAWER_WIDTH} items={menus} />

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
