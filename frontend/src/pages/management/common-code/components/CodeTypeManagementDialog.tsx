import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MediumButton from '@/components/common/button/MediumButton';
import { CodeTypeOption } from '@/mocks/commonCodeDb';

interface CodeTypeManagementDialogProps {
  open: boolean;
  onClose: () => void;
  codeTypes: CodeTypeOption[];
  onSave: (codeTypes: CodeTypeOption[]) => void;
}

const CodeTypeManagementDialog: React.FC<CodeTypeManagementDialogProps> = ({
  open,
  onClose,
  codeTypes,
  onSave,
}) => {
  const [editableCodeTypes, setEditableCodeTypes] = useState<CodeTypeOption[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (open) {
      setEditableCodeTypes([...codeTypes]);
      setSearchText('');
    }
  }, [open, codeTypes]);

  const filteredCodeTypes = useMemo(() => {
    if (!searchText.trim()) {
      return editableCodeTypes;
    }
    const lowerSearch = searchText.toLowerCase();
    return editableCodeTypes.filter(
      (ct) =>
        ct.value.toLowerCase().includes(lowerSearch) ||
        ct.label.toLowerCase().includes(lowerSearch),
    );
  }, [editableCodeTypes, searchText]);

  const handleAdd = () => {
    setEditableCodeTypes([...editableCodeTypes, { value: '', label: '' } as CodeTypeOption]);
  };

  const handleDelete = (index: number) => {
    setEditableCodeTypes(editableCodeTypes.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: 'value' | 'label', newValue: string) => {
    const updated = [...editableCodeTypes];
    updated[index] = { ...updated[index], [field]: newValue };
    setEditableCodeTypes(updated);
  };

  const handleSave = () => {
    // 빈 값 필터링
    const filtered = editableCodeTypes.filter((ct) => ct.value && ct.label);
    onSave(filtered);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>코드 타입 관리</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              코드 타입을 추가하거나 수정할 수 있습니다.
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="코드 값 또는 표시명으로 검색..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          <Box
            sx={{
              maxHeight: 400,
              overflowY: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
            }}
          >
            <Stack spacing={2}>
              {filteredCodeTypes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {searchText ? '검색 결과가 없습니다.' : '코드 타입이 없습니다.'}
                </Typography>
              ) : (
                filteredCodeTypes.map((codeType, index) => {
                  const actualIndex = editableCodeTypes.findIndex(
                    (ct) => ct.value === codeType.value && ct.label === codeType.label,
                  );
                  return (
                    <Stack key={actualIndex} direction="row" spacing={1} alignItems="center">
                      <TextField
                        label="코드 값"
                        size="small"
                        value={codeType.value}
                        onChange={(e) => handleChange(actualIndex, 'value', e.target.value)}
                        placeholder="예: SERVICE_NAME"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="표시명"
                        size="small"
                        value={codeType.label}
                        onChange={(e) => handleChange(actualIndex, 'label', e.target.value)}
                        placeholder="예: 서비스명"
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(actualIndex)}
                        disabled={editableCodeTypes.length === 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  );
                })
              )}
            </Stack>
          </Box>

          <Divider />

          <MediumButton
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ alignSelf: 'flex-start' }}
          >
            코드 타입 추가
          </MediumButton>
        </Stack>
      </DialogContent>
      <DialogActions>
        <MediumButton variant="outlined" onClick={handleCancel}>
          취소
        </MediumButton>
        <MediumButton variant="contained" onClick={handleSave}>
          저장
        </MediumButton>
      </DialogActions>
    </Dialog>
  );
};

export default CodeTypeManagementDialog;
