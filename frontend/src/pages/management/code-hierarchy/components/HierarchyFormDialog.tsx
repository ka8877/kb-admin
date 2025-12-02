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
  FormHelperText,
} from '@mui/material';
import { commonCodeMockDb } from '@/mocks/commonCodeDb';
import { HierarchyValidator } from '../validation';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
    setFieldErrors({});
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

      // 해당 필드 오류 제거
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    },
    [availableCodeTypes],
  );

  const handleTextChange = useCallback(
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // 해당 필드 오류 제거
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    },
    [],
  );

  const validateAndShowErrors = useCallback((): boolean => {
    const fieldValidationResults = HierarchyValidator.validateByField(formData);

    const errors: Record<string, string> = {};
    let hasErrors = false;

    Object.entries(fieldValidationResults).forEach(([field, result]) => {
      if (!result.isValid && result.message) {
        errors[field] = result.message;
        hasErrors = true;
      }
    });

    setFieldErrors(errors);
    return !hasErrors;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateAndShowErrors()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setFieldErrors((prev) => ({
        ...prev,
        _global: err instanceof Error ? err.message : '저장에 실패했습니다.',
      }));
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, onClose, validateAndShowErrors]);
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editData ? '계층 구조 수정' : '계층 구조 등록'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {fieldErrors._global && <Alert severity="error">{fieldErrors._global}</Alert>}
          <FormControl fullWidth required disabled={!!editData} error={!!fieldErrors.parentType}>
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
            {fieldErrors.parentType && <FormHelperText>{fieldErrors.parentType}</FormHelperText>}
          </FormControl>

          <TextField
            label="부모 레이블"
            value={formData.parentLabel}
            onChange={handleTextChange('parentLabel')}
            placeholder="예: 서비스명, 지역"
            helperText={fieldErrors.parentLabel || '화면에 표시될 부모 항목의 이름 (자동 입력됨)'}
            fullWidth
            required
            error={!!fieldErrors.parentLabel}
          />

          <FormControl fullWidth required disabled={!!editData} error={!!fieldErrors.childType}>
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
            {fieldErrors.childType && <FormHelperText>{fieldErrors.childType}</FormHelperText>}
          </FormControl>

          <TextField
            label="자식 레이블"
            value={formData.childLabel}
            onChange={handleTextChange('childLabel')}
            placeholder="예: 질문 카테고리, 지점"
            helperText={fieldErrors.childLabel || '화면에 표시될 자식 항목의 이름 (자동 입력됨)'}
            fullWidth
            required
            error={!!fieldErrors.childLabel}
          />

          <TextField
            label="관계 필드명"
            value={formData.relationField}
            onChange={handleTextChange('relationField')}
            placeholder="예: parent_service_cd"
            helperText={fieldErrors.relationField || '자식 데이터에서 부모를 참조하는 필드명 (자동 생성됨)'}
            disabled
            fullWidth
            required
            error={!!fieldErrors.relationField}
          />

          {fieldErrors.typesDifferent && (
            <Alert severity="error">{fieldErrors.typesDifferent}</Alert>
          )}
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
