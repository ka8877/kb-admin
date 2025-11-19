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
  Typography,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import type { MenuItem } from '@/routes/menu';
import { registeredPathSet } from '@/routes/registry';
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
      <Box sx={{ overflow: 'auto', px: 2, py: 2 }}>
        {/* Category Title (1depth) */}
        {shownTop && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
            }}
          >
            {shownTop.label}
          </Typography>
        )}

        {/* Menu Items (2depth with expand/collapse) */}
        <List disablePadding>
          {twoDepthItems.map((item) => {
            const selected = pathname === item.path || pathname.startsWith(item.path + '/');
            const hasChildren = !!(item.children && item.children.length);
            const open = openMap[item.path] ?? selected;

            return (
              <React.Fragment key={item.path}>
                <ListItemButton
                  component={hasChildren ? 'div' : RouterLink}
                  to={hasChildren ? undefined : item.path}
                  selected={selected}
                  onClick={() => (hasChildren ? toggleOpen(item.path) : undefined)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: selected ? 600 : 400,
                    }}
                  />
                  {hasChildren && (
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </ListItemIcon>
                  )}
                </ListItemButton>
                {hasChildren && (
                  <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children!.map((child) => {
                        const childSelected =
                          pathname === child.path || pathname.startsWith(child.path + '/');
                        return (
                          <ListItemButton
                            key={child.path}
                            component={RouterLink}
                            to={child.path}
                            selected={childSelected}
                            sx={{
                              pl: 4,
                              borderRadius: 1,
                              mb: 0.5,
                              '&.Mui-selected': {
                                bgcolor: 'primary.lighter',
                                color: 'primary.main',
                                '&:hover': {
                                  bgcolor: 'primary.lighter',
                                },
                              },
                            }}
                          >
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{
                                fontSize: '0.8125rem',
                                fontWeight: childSelected ? 600 : 400,
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideNav;
