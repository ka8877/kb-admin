import type React from 'react'
import { Box, Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import type { MenuItem } from '../../routes/menu'
import { registeredPathSet } from '../../routes/registry'

export type SideNavProps = {
  drawerWidth: number
  items: MenuItem[]
}

const SideNav: React.FC<SideNavProps> = ({ drawerWidth, items }) => {
  const { pathname } = useLocation()
  const safeItems = items.filter((m) => registeredPathSet.has(m.path))

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        },
      }}
      open
    >
      {/* Push below AppBar */}
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List dense>
          {safeItems.map((m) => (
            <ListItemButton key={m.path} component={RouterLink} to={m.path} selected={pathname === m.path}>
              <ListItemText primary={m.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}

export default SideNav
