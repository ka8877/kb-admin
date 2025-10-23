import { PropsWithChildren } from 'react';
import { Box, Container, Toolbar, Avatar, Stack, Typography } from '@mui/material';
import AppHeader from '../components/layout/AppHeader';
import SideNav from '../components/layout/SideNav';
import { DRAWER_WIDTH } from '../constants';
import { frontMenus } from '../routes/menu';
import { useAuthStore } from '../store/auth';

const MainLayout = ({ children }: PropsWithChildren) => {
  const user = useAuthStore((s) => s.user);
  const right = user ? (
    <Stack direction="row" spacing={1} alignItems="center">
      <Avatar sx={{ width: 28, height: 28 }}>
        {user.name?.charAt(0) || '?'}
      </Avatar>
      <Typography variant="body2" color="text.secondary">
        {user.name}
      </Typography>
    </Stack>
  ) : null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader drawerWidth={DRAWER_WIDTH} right={right} />

      <SideNav drawerWidth={DRAWER_WIDTH} items={frontMenus} />

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
