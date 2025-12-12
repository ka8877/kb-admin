// 메뉴 트리 컴포넌트

import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { MenuTreeItem } from '../types';

interface MenuTreeProps {
  menus: MenuTreeItem[];
  selectedMenuIds: Set<string | number>;
  onMenuToggle: (menuId: string | number, checked: boolean) => void;
  disabled?: boolean;
}

const MenuTreeNode: React.FC<{
  menu: MenuTreeItem;
  selectedMenuIds: Set<string | number>;
  onMenuToggle: (menuId: string | number, checked: boolean) => void;
  disabled?: boolean;
  isChild?: boolean;
}> = ({ menu, selectedMenuIds, onMenuToggle, disabled = false, isChild = false }) => {
  const hasChildren = menu.children && menu.children.length > 0;
  const isChecked = selectedMenuIds.has(menu.id);

  // 모든 하위 메뉴 ID 수집
  const getAllChildIds = (item: MenuTreeItem): (string | number)[] => {
    const ids: (string | number)[] = [item.id];
    if (item.children) {
      item.children.forEach((child) => {
        ids.push(...getAllChildIds(child));
      });
    }
    return ids;
  };

  // 상위 메뉴 토글 시 하위 메뉴도 함께 토글
  const handleToggleWithChildren = (checked: boolean) => {
    const allIds = getAllChildIds(menu);
    allIds.forEach((id) => onMenuToggle(id, checked));
  };

  if (!hasChildren) {
    // 자식이 없는 메뉴 - 체크박스만 표시
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

  // 자식이 있는 메뉴 - Accordion으로 표시
  return (
    <Accordion
      defaultExpanded
      elevation={0}
      sx={{
        '&:before': { display: 'none' },
        my: 0,
        '& .MuiAccordion-region': { height: 'auto' },
        '& .MuiAccordionSummary-root': {
          minHeight: 'unset',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 'unset',
          height: 'auto',
          py: '2px',
          my: 0,
          '& .MuiAccordionSummary-content': {
            margin: '2px 0',
          },
          '& .MuiAccordionSummary-content.Mui-expanded': {
            margin: '2px 0',
          },
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                handleToggleWithChildren(e.target.checked);
              }}
              disabled={disabled}
              size="small"
              onClick={(e) => e.stopPropagation()}
            />
          }
          label={
            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.875rem' }}>
              {menu.label}
            </Typography>
          }
          sx={{ m: 0 }}
          onClick={(e) => e.stopPropagation()}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0.5, pl: 4, pt: '4px' }}>
        <Stack spacing={0}>
          {menu.children?.map((child) => (
            <MenuTreeNode
              key={child.id}
              menu={child}
              selectedMenuIds={selectedMenuIds}
              onMenuToggle={onMenuToggle}
              disabled={disabled}
              isChild={true}
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
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
