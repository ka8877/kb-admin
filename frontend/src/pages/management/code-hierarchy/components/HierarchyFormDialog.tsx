import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { commonCodeMockDb } from '@/mocks/commonCodeDb';
import type { HierarchyDefinition } from '../types';

interface HierarchyFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<HierarchyDefinition, 'id'>) => Promise<void>;
  editData?: HierarchyDefinition | null;
}

const HierarchyFormDialog: React.FC<HierarchyFormDialogProps> = ({
  open,
  onClose,
  onSave,
  editData,
}) => {
  const [formData, setFormData] = useState({
    parentType: '',
    parentLabel: '',
    childType: '',
    childLabel: '',
    relationField: '',
  });
  const [availableCodeTypes, setAvailableCodeTypes] = useState<
    Array<{ type: string; label: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 관계 필드명 자동 생성 (useMemo로 최적화)
  const relationField = useMemo(() => {
    if (formData.parentType && formData.childType) {
      return `parent_${formData.parentType.toLowerCase()}_cd`;
    }
    return '';
  }, [formData.parentType, formData.childType]);

  // relationField가 변경되면 formData 업데이트
  useEffect(() => {
    if (relationField) {
      setFormData((prev) => ({ ...prev, relationField }));
    }
  }, [relationField]);

  // 다이얼로그 열릴 때 초기화 및 데이터 로드
  useEffect(() => {
    console.log('Dialog open state:', open);
    if (!open) return;

    const loadCodeTypes = async () => {
      try {
        console.log('Loading code types...');
        const codeTypes = await commonCodeMockDb.getCodeTypes();
        console.log('Loaded code types:', codeTypes);
        setAvailableCodeTypes(
          codeTypes.map((ct) => ({
            type: ct.value,
            label: ct.label,
          })),
        );
      } catch (error) {
        console.error('Failed to load code types:', error);
      }
    };

    loadCodeTypes();

    // 폼 데이터 초기화
    if (editData) {
      setFormData({
        parentType: editData.parentType,
        parentLabel: editData.parentLabel,
        childType: editData.childType,
        childLabel: editData.childLabel,
        relationField: editData.relationField,
      });
    } else {
      setFormData({
        parentType: '',
        parentLabel: '',
        childType: '',
        childLabel: '',
        relationField: '',
      });
    }
    setError(null);
  }, [open, editData]);

  const handleSelectChange = useCallback(
    (field: 'parentType' | 'childType') => (event: SelectChangeEvent<string>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // 코드 타입 선택 시 자동으로 레이블 설정
      const selectedType = availableCodeTypes.find((ct) => ct.type === value);
      if (selectedType) {
        const labelField = field === 'parentType' ? 'parentLabel' : 'childLabel';
        setFormData((prev) => ({ ...prev, [labelField]: selectedType.label }));
      }

      setError(null);
    },
    [availableCodeTypes],
  );

  const handleTextChange = useCallback(
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null);
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    // 유효성 검증
    if (!formData.parentType.trim()) {
      setError('부모 코드 타입을 선택하세요.');
      return;
    }
    if (!formData.parentLabel.trim()) {
      setError('부모 레이블을 입력하세요.');
      return;
    }
    if (!formData.childType.trim()) {
      setError('자식 코드 타입을 선택하세요.');
      return;
    }
    if (!formData.childLabel.trim()) {
      setError('자식 레이블을 입력하세요.');
      return;
    }
    if (!formData.relationField.trim()) {
      setError('관계 필드명을 입력하세요.');
      return;
    }

    // 부모와 자식이 같은 타입인지 체크
    if (formData.parentType === formData.childType) {
      setError('부모와 자식 코드 타입은 달라야 합니다.');
      return;
    }

    // 관계 필드명은 snake_case 형식
    const fieldPattern = /^[a-z][a-z0-9_]*$/;
    if (!fieldPattern.test(formData.relationField)) {
      setError('관계 필드명은 소문자, 숫자, 언더스코어(_)만 사용하며 소문자로 시작해야 합니다.');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editData ? '계층 구조 수정' : '계층 구조 등록'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth required disabled={!!editData}>
            <InputLabel>부모 코드 타입 (카테고리)</InputLabel>
            <Select
              value={formData.parentType}
              onChange={handleSelectChange('parentType')}
              label="부모 코드 타입 (카테고리)"
            >
              {availableCodeTypes.map((codeType) => (
                <MenuItem key={codeType.type} value={codeType.type}>
                  {codeType.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="부모 레이블"
            value={formData.parentLabel}
            onChange={handleTextChange('parentLabel')}
            placeholder="예: 서비스명, 지역"
            helperText="화면에 표시될 부모 항목의 이름 (자동 입력됨)"
            fullWidth
            required
          />

          <FormControl fullWidth required disabled={!!editData}>
            <InputLabel>자식 코드 타입 (카테고리)</InputLabel>
            <Select
              value={formData.childType}
              onChange={handleSelectChange('childType')}
              label="자식 코드 타입 (카테고리)"
            >
              {availableCodeTypes
                .filter((ct) => ct.type !== formData.parentType)
                .map((codeType) => (
                  <MenuItem key={codeType.type} value={codeType.type}>
                    {codeType.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            label="자식 레이블"
            value={formData.childLabel}
            onChange={handleTextChange('childLabel')}
            placeholder="예: 질문 카테고리, 지점"
            helperText="화면에 표시될 자식 항목의 이름 (자동 입력됨)"
            fullWidth
            required
          />

          <TextField
            label="관계 필드명"
            value={formData.relationField}
            onChange={handleTextChange('relationField')}
            placeholder="예: parent_service_cd"
            helperText="자식 데이터에서 부모를 참조하는 필드명 (자동 생성됨)"
            disabled
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HierarchyFormDialog;
