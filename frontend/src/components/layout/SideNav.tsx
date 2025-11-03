import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Collapse,
  ListItemIcon,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import type { MenuItem } from '../../routes/menu';
import { registeredPathSet } from '../../routes/registry';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

export type SideNavProps = {
  drawerWidth: number;
  items: MenuItem[];
};

const SideNav: React.FC<SideNavProps> = ({ drawerWidth, items }) => {
  const { pathname } = useLocation();

  const activeTop = items.find((m) => {
    if (m.path === pathname) return true;
    if (pathname.startsWith(m.path === '/' ? '/' : m.path + '/')) return true;
    if (m.children) {
      const stack: MenuItem[] = [...m.children];
      while (stack.length) {
        const it = stack.pop()!;
        if (it.path === pathname) return true;
        if (it.children) stack.push(...it.children);
        if (pathname.startsWith(it.path === '/' ? '/' : it.path + '/')) return true;
      }
    }
    return false;
  });

  const safeTopItems = items.filter((m) => registeredPathSet.has(m.path));

  const shownTop = activeTop && registeredPathSet.has(activeTop.path) ? activeTop : safeTopItems[0];

  const twoDepthItems = shownTop?.children ?? [];

  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});

  const toggleOpen = (key: string) => setOpenMap((s) => ({ ...s, [key]: !s[key] }));

  const renderNested = (list: MenuItem[], level = 2) => (
    <List component="div" disablePadding>
      {list.map((it) => {
        const selected = pathname === it.path || pathname.startsWith(it.path + '/');
        const hasChildren = !!(it.children && it.children.length);
        const open = openMap[it.path] ?? selected;
        return (
          <React.Fragment key={it.path}>
            <ListItemButton
              sx={{ pl: level * 2 }}
              component={hasChildren ? 'div' : RouterLink}
              to={hasChildren ? undefined : it.path}
              selected={selected}
              onClick={() => (hasChildren ? toggleOpen(it.path) : undefined)}
            >
              {hasChildren && (
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemIcon>
              )}
              <ListItemText primary={it.label} />
            </ListItemButton>
            {hasChildren && (
              <Collapse in={open} timeout="auto" unmountOnExit>
                {renderNested(it.children!, level + 1)}
              </Collapse>
            )}
          </React.Fragment>
        );
      })}
    </List>
  );

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
          {shownTop && (
            <ListItemButton
              component={RouterLink}
              to={shownTop.path}
              selected={pathname === shownTop.path}
            >
              <ListItemText primary={shownTop.label} />
            </ListItemButton>
          )}
        </List>

        <Box sx={{ px: 1 }}>{renderNested(twoDepthItems, 2)}</Box>
      </Box>
    </Drawer>
  );
};

export default SideNav;
