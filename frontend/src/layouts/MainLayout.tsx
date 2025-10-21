import { PropsWithChildren } from 'react'
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { topMenus } from '../routes/menu'

const MainLayout = ({ children }: PropsWithChildren) => {
  const { pathname } = useLocation()
  const isActive = (to: string) => (pathname === to ? 'underline' : 'none')

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Admin
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {topMenus.map((m) => (
            <Button key={m.path} color="inherit" component={RouterLink} to={m.path} sx={{ textDecoration: isActive(m.path) }}>
              {m.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  )
}

export default MainLayout
