import React from 'react';
import { Paper, Stack, Typography, List, ListItemButton, ListItemText, Chip } from '@mui/material';
import type { GenericCodeItem, HierarchyDefinition } from '../types';

interface ParentListProps {
  selectedHierarchy: HierarchyDefinition;
  parentItems: GenericCodeItem[];
  selectedParentCode: string | null;
  onParentClick: (code: string) => void;
  getChildCount: (parentCode: string) => number;
}

const ParentList: React.FC<ParentListProps> = ({
  selectedHierarchy,
  parentItems,
  selectedParentCode,
  onParentClick,
  getChildCount,
}) => {
  return (
    <Paper sx={{ p: 2, height: 600, overflow: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {selectedHierarchy.parentLabel}
        </Typography>
        <Chip label={`${parentItems.length}개`} size="small" color="primary" />
      </Stack>
      <List>
        {parentItems.map((parent) => {
          const childCount = getChildCount(parent.code);
          return (
            <ListItemButton
              key={parent.code}
              selected={selectedParentCode === parent.code}
              onClick={() => onParentClick(parent.code)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <span>{parent.name}</span>
                    {childCount > 0 && (
                      <Chip
                        label={childCount}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor:
                            selectedParentCode === parent.code
                              ? 'rgba(255,255,255,0.3)'
                              : 'action.selected',
                        }}
                      />
                    )}
                  </Stack>
                }
                secondary={parent.code}
                secondaryTypographyProps={{
                  sx: {
                    color: selectedParentCode === parent.code ? 'inherit' : 'text.secondary',
                    opacity: selectedParentCode === parent.code ? 0.8 : 1,
                  },
                }}
              />
            </ListItemButton>
          );
        })}
        {parentItems.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            등록된 {selectedHierarchy.parentLabel}이(가) 없습니다
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default ParentList;
