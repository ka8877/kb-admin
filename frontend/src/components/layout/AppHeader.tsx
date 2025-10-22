import type React from 'react'
import { AppBar, Box, Toolbar, Typography } from '@mui/material'

export type AppHeaderProps = {
  title?: string
  drawerWidth?: number
  right?: React.ReactNode
}

const AppHeader: React.FC<AppHeaderProps> = ({ title = 'kakaobank AI', drawerWidth = 0, right }) => {
  const headerSx = drawerWidth
    ? { width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }
    : undefined

  return (
    <AppBar position="fixed" color="primary" enableColorOnDark sx={headerSx}>
      <Toolbar sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {right}
      </Toolbar>
    </AppBar>
  )
}

export default AppHeader
