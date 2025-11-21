import React, { useCallback, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Stack,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  InputLabel,
  Typography,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { RowItem } from './types';
import { listColumns } from './components/columns';
import { CODE_TYPE_LABELS } from './components/columns';
import EditableList from '@/components/common/list/EditableList';
import DetailNavigationActions from '@/components/common/actions/DetailNavigationActions';
import PageHeader from '@/components/common/PageHeader';
import MediumButton from '@/components/common/button/MediumButton';
import Section from '@/components/layout/Section';
import CommonCodeTypeEditPage from './CommonCodeTypeEditPage';
import { ROUTES } from '@/routes/menu';
import { commonCodeMockDb, CodeType, CodeTypeOption } from '@/mocks/commonCodeDb';
import type { GridColDef } from '@mui/x-data-grid';

const CommonCodePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // location.state에서 편집 페이지에서 돌아온 경우 codeType 가져오기
  const returnedCodeType = (location.state as { codeType?: CodeType })?.codeType;

  const [selectedCodeType, setSelectedCodeType] = useState<CodeType | ''>(returnedCodeType || '');
  const [showError, setShowError] = useState(false);
  const [codeTypeOptions, setCodeTypeOptions] = useState<CodeTypeOption[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 코드 타입 옵션 로드
  React.useEffect(() => {
    commonCodeMockDb.getCodeTypes().then((options) => {
      setCodeTypeOptions(options);
    });
  }, []);

  const listApi = useMemo(
    () => ({
      list: async (): Promise<RowItem[]> => {
        if (!selectedCodeType) {
          return [];
        }
        const allData = await commonCodeMockDb.listAll();
        const filtered = allData.filter((item) => item.code_type === selectedCodeType);
        // NO를 1번부터 재계산
        return filtered.map((item, index) => ({
          ...item,
          display_no: index + 1,
        }));
      },
    }),
    [selectedCodeType],
  );

  const handleGoEditPage = useCallback(() => {
    if (!selectedCodeType) {
      setShowError(true);
      return;
    }
    navigate(ROUTES.COMMON_CODE_EDIT, { state: { codeType: selectedCodeType } });
  }, [navigate, selectedCodeType]);

  const handleCodeTypeChange = useCallback((event: SelectChangeEvent<CodeType | ''>) => {
    setSelectedCodeType(event.target.value as CodeType | '');
    setShowError(false);
  }, []);

  const handleAddCodeType = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  // 동적으로 컬럼 필터링: 질문 카테고리일 때만 서비스 그룹, 서비스 그룹 코드 컬럼 표시
  const filteredColumns = useMemo<GridColDef<RowItem>[]>(() => {
    if (selectedCodeType === 'QUESTION_CATEGORY') {
      return listColumns; // 모든 컬럼 포함 (parent_service_cd, service_group_name 포함)
    }
    // QUESTION_CATEGORY가 아니면 parent_service_cd, service_group_name 컬럼 제외
    return listColumns.filter(
      (col) => col.field !== 'service_group_name' && col.field !== 'parent_service_cd',
    );
  }, [selectedCodeType]);

  const handleSaveCodeTypes = useCallback(async (newCodeTypes: CodeTypeOption[]) => {
    try {
      const savedCodeTypes = await commonCodeMockDb.saveCodeTypes(newCodeTypes);
      setCodeTypeOptions(savedCodeTypes);
    } catch (error) {
      console.error('Failed to save code types:', error);
    }
  }, []);

  return (
    <Box>
      <PageHeader title="공통 코드 관리" />
      <Section>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <MediumButton variant="outlined" startIcon={<AddIcon />} onClick={handleAddCodeType}>
              코드 타입 추가
            </MediumButton>
            <FormControl size="small" sx={{ minWidth: 200 }} error={showError}>
              <InputLabel id="code-type-select-label">코드 타입</InputLabel>
              <Select
                labelId="code-type-select-label"
                value={selectedCodeType}
                onChange={handleCodeTypeChange}
                label="코드 타입"
              >
                <MenuItem value="" disabled>
                  선택하세요
                </MenuItem>
                {codeTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {showError && (
              <Typography variant="body2" color="error">
                코드 타입을 선택해주세요
              </Typography>
            )}
          </Stack>

          <DetailNavigationActions onEdit={handleGoEditPage} />
        </Stack>

        {!selectedCodeType ? (
          <Box
            sx={{
              height: 420,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              코드 타입을 선택해주세요
            </Typography>
          </Box>
        ) : (
          <EditableList<RowItem>
            key={selectedCodeType}
            columns={filteredColumns}
            fetcher={listApi.list}
            rowIdGetter={(r: RowItem) => r.service_cd}
            defaultPageSize={25}
            pageSizeOptions={[10, 25, 50, 100]}
            isEditMode={false}
          />
        )}
      </Section>

      <CommonCodeTypeEditPage
        open={dialogOpen}
        onClose={handleCloseDialog}
        codeTypes={codeTypeOptions}
        onSave={handleSaveCodeTypes}
      />
    </Box>
  );
};

export default CommonCodePage;
