import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Stack,
} from '@mui/material';
import type { MenuTreeItem } from '../types';

interface MenuTreeProps {
  menus: MenuTreeItem[];
  selectedMenuIds: Set<string | number>;
  onMenuToggle: (menuId: string | number, checked: boolean) => void;
  disabled?: boolean;
}

interface MenuTreeNodeProps {
  menu: MenuTreeItem;
  selectedMenuIds: Set<string | number>;
  onMenuToggle: (menuId: string | number, checked: boolean) => void;
  disabled?: boolean;
  isChild?: boolean;
}

const MenuTreeNode: React.FC<MenuTreeNodeProps> = ({
  menu,
  selectedMenuIds,
  onMenuToggle,
  disabled = false,
  isChild = false,
}) => {
  const hasChildren = Boolean(menu.children && menu.children.length);
  const isChecked = selectedMenuIds.has(menu.id);

  if (!hasChildren) {
    if (!isChild) {
      return (
        <Typography variant="body2" sx={{ fontSize: '0.875rem', my: '6px', pl: 0.5 }}>
          {menu.label}
        </Typography>
      );
    }

    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={isChecked}
            onChange={(e) => onMenuToggle(menu.id, e.target.checked)}
            disabled={disabled}
            size="small"
          />
        }
        label={
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {menu.label}
          </Typography>
        }
        sx={{ my: '4px' }}
      />
    );
  }

  return (
    <Box sx={{ my: 1 }}>
      <Typography 
        variant="body2" 
        fontWeight="medium" 
        sx={{ fontSize: '0.875rem', mb: 0.5, color: 'text.secondary' }}
      >
        {menu.label}
      </Typography>
      <Stack spacing={0} sx={{ pl: 2 }}>
        {menu.children?.map((child) => (
          <MenuTreeNode
            key={child.id}
            menu={child}
            selectedMenuIds={selectedMenuIds}
            onMenuToggle={onMenuToggle}
            disabled={disabled}
            isChild
          />
        ))}
      </Stack>
    </Box>
  );
};

export const MenuTree: React.FC<MenuTreeProps> = ({
  menus,
  selectedMenuIds,
  onMenuToggle,
  disabled = false,
}) => {
  return (
    <Box>
      {menus.map((menu) => (
        <MenuTreeNode
          key={menu.id}
          menu={menu}
          selectedMenuIds={selectedMenuIds}
          onMenuToggle={onMenuToggle}
          disabled={disabled}
        />
      ))}
    </Box>
  );
};
