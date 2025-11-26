import React from 'react';
import {
  Stack,
  Paper,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import type { HierarchyDefinition } from '../types';

interface HierarchyToolbarProps {
  hierarchyDefinitions: HierarchyDefinition[];
  selectedHierarchy: HierarchyDefinition | null;
  onHierarchyChange: (event: SelectChangeEvent<string>) => void;
  onAddHierarchy: () => void;
  onEditHierarchy: () => void;
  onDeleteHierarchy: () => void;
  onLinkData: () => void;
}

const HierarchyToolbar: React.FC<HierarchyToolbarProps> = ({
  hierarchyDefinitions,
  selectedHierarchy,
  onHierarchyChange,
  onAddHierarchy,
  onEditHierarchy,
  onDeleteHierarchy,
  onLinkData,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2, backgroundColor: 'background.default' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <AccountTreeIcon color="primary" />
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <Select value={selectedHierarchy?.id || ''} onChange={onHierarchyChange} displayEmpty>
            {hierarchyDefinitions.map((def) => (
              <MenuItem key={def.id} value={def.id}>
                {def.parentLabel} → {def.childLabel}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          관리할 계층 구조를 선택하세요
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddHierarchy} size="small">
            계층 구조 등록
          </Button>
          {selectedHierarchy && (
            <>
              <Button variant="outlined" startIcon={<LinkIcon />} onClick={onLinkData} size="small">
                데이터 연결
              </Button>
              <Tooltip title="계층 구조 수정">
                <IconButton size="small" onClick={onEditHierarchy} color="primary">
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="계층 구조 삭제">
                <IconButton size="small" onClick={onDeleteHierarchy} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default HierarchyToolbar;
