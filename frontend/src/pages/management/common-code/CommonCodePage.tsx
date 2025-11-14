import React, { useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CodeTypeManagementDialog from './components/CodeTypeManagementDialog';
import { ROUTES } from '@/routes/menu';
import { commonCodeMockDb, CodeType, CodeTypeOption } from '@/mocks/commonCodeDb';

const CommonCodePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCodeType, setSelectedCodeType] = useState<CodeType | ''>('');
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
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            bgcolor: '#fafafa',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            코드 타입을 선택해주세요
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 420, width: '100%' }}>
          <EditableList<RowItem>
            key={selectedCodeType}
            columns={listColumns}
            fetcher={listApi.list}
            rowIdGetter={(r: RowItem) => r.service_cd}
            defaultPageSize={25}
            pageSizeOptions={[10, 25, 50, 100]}
            isEditMode={false}
          />
        </Box>
      )}

      <CodeTypeManagementDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        codeTypes={codeTypeOptions}
        onSave={handleSaveCodeTypes}
      />
    </Box>
  );
};

export default CommonCodePage;
