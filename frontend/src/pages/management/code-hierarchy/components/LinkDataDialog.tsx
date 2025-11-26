import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { commonCodeMockDb } from '@/mocks/commonCodeDb';
import type { GenericCodeItem, HierarchyDefinition } from '../types';

// 코드 타입을 한글명으로 변환
const getCodeTypeLabel = (codeType: string): string => {
  const typeMap: Record<string, string> = {
    SERVICE_NAME: '서비스명',
    QUESTION_CATEGORY: '질문 카테고리',
    AGE_GROUP: '연령대',
  };
  return typeMap[codeType] || codeType;
};

interface LinkDataDialogProps {
  open: boolean;
  onClose: () => void;
  selectedHierarchy: HierarchyDefinition | null;
  onSave: (parentCode: string, childCodes: string[]) => void;
}

const LinkDataDialog: React.FC<LinkDataDialogProps> = ({
  open,
  onClose,
  selectedHierarchy,
  onSave,
}) => {
  const [parentItems, setParentItems] = useState<GenericCodeItem[]>([]);
  const [childItems, setChildItems] = useState<GenericCodeItem[]>([]);
  const [selectedParentCode, setSelectedParentCode] = useState('');
  const [selectedChildCodes, setSelectedChildCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && selectedHierarchy) {
      loadData();
    }
  }, [open, selectedHierarchy]);

  const loadData = async () => {
    if (!selectedHierarchy) return;

    try {
      const allData = await commonCodeMockDb.listAll();

      // 부모 아이템
      const parents = allData
        .filter((item) => item.code_type === selectedHierarchy.parentType)
        .map((item) => ({
          no: item.no,
          code: item.service_cd,
          name: item.category_nm,
          displayYn: item.status_code,
          sortOrder: item.no,
          codeType: item.code_type,
        }));

      // 자식 아이템
      const children = allData
        .filter((item) => item.code_type === selectedHierarchy.childType)
        .map((item) => ({
          no: item.no,
          code: item.service_cd,
          name: item.category_nm,
          displayYn: item.status_code,
          sortOrder: item.no,
          codeType: item.code_type,
          parentCode: item.parent_service_cd,
        }));

      setParentItems(parents);
      setChildItems(children);
      setSelectedParentCode('');
      setSelectedChildCodes([]);
      setError(null);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // 선택된 부모에 연결 안된 자식들만 필터링
  const availableChildren = childItems.filter(
    (child) => !child.parentCode || child.parentCode === selectedParentCode,
  );

  const handleSubmit = async () => {
    if (!selectedParentCode) {
      setError('부모 항목을 선택하세요.');
      return;
    }
    if (selectedChildCodes.length === 0) {
      setError('자식 항목을 최소 1개 이상 선택하세요.');
      return;
    }

    setLoading(true);
    try {
      // 선택된 모든 자식에 대해 parent_service_cd 업데이트
      for (const childCode of selectedChildCodes) {
        const allData = await commonCodeMockDb.listAll();
        const childItem = allData.find(
          (item) =>
            item.service_cd === childCode && item.code_type === selectedHierarchy!.childType,
        );

        if (childItem) {
          await commonCodeMockDb.update(childCode, {
            ...childItem,
            parent_service_cd: selectedParentCode,
          });
        }
      }

      onSave(selectedParentCode, selectedChildCodes);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedHierarchy) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>데이터 연결</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              연결할 계층 구조
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {selectedHierarchy.parentLabel} → {selectedHierarchy.childLabel}
            </Typography>
          </Box>

          <FormControl fullWidth required>
            <InputLabel>{getCodeTypeLabel(selectedHierarchy.parentType)} 선택</InputLabel>
            <Select
              value={selectedParentCode}
              onChange={(e) => {
                setSelectedParentCode(e.target.value);
                setSelectedChildCodes([]);
                setError(null);
              }}
              label={`${getCodeTypeLabel(selectedHierarchy.parentType)} 선택`}
            >
              {parentItems.map((parent) => (
                <MenuItem key={parent.code} value={parent.code}>
                  {parent.name} ({parent.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedParentCode && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {getCodeTypeLabel(selectedHierarchy.childType)} 선택 (다중 선택 가능)
              </Typography>
              <FormGroup
                sx={{
                  maxHeight: 300,
                  overflow: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                {availableChildren.length > 0 ? (
                  availableChildren.map((child) => (
                    <FormControlLabel
                      key={child.code}
                      control={
                        <Checkbox
                          checked={selectedChildCodes.includes(child.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedChildCodes([...selectedChildCodes, child.code]);
                            } else {
                              setSelectedChildCodes(
                                selectedChildCodes.filter((c) => c !== child.code),
                              );
                            }
                            setError(null);
                          }}
                        />
                      }
                      label={`${child.name} (${child.code})`}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    연결 가능한 항목이 없습니다.
                  </Typography>
                )}
              </FormGroup>
              {selectedChildCodes.length > 0 && (
                <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                  {selectedChildCodes.length}개 선택됨
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? '저장 중...' : '연결'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkDataDialog;
