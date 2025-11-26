import React from 'react';
import { Paper, Stack, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import type { GenericCodeItem, HierarchyDefinition } from '../types';

interface ChildListProps {
  selectedHierarchy: HierarchyDefinition;
  selectedParent: GenericCodeItem | undefined;
  filteredChildren: GenericCodeItem[];
  onUnlinkChild?: (childCode: string) => void;
}

const ChildList: React.FC<ChildListProps> = ({
  selectedHierarchy,
  selectedParent,
  filteredChildren,
  onUnlinkChild,
}) => {
  return (
    <Paper sx={{ p: 2, height: 600, overflow: 'auto' }}>
      {selectedParent ? (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              {selectedParent.name} - {selectedHierarchy.childLabel}
            </Typography>
            <Chip label={`${filteredChildren.length}개`} size="small" color="secondary" />
          </Stack>
          <Stack spacing={1}>
            {filteredChildren.map((child) => (
              <Paper
                key={child.code}
                variant="outlined"
                sx={{
                  p: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {child.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      코드: {child.code}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={child.displayYn === 'Y' ? '활성' : '비활성'}
                      size="small"
                      color={child.displayYn === 'Y' ? 'success' : 'default'}
                      variant="outlined"
                    />
                    {onUnlinkChild && (
                      <Tooltip title="연결 해제">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onUnlinkChild(child.code)}
                        >
                          <LinkOffIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
            {filteredChildren.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', py: 4 }}
              >
                등록된 {selectedHierarchy.childLabel}이(가) 없습니다
              </Typography>
            )}
          </Stack>
        </>
      ) : (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            좌측에서 {selectedHierarchy.parentLabel}을(를) 선택하세요
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ChildList;
