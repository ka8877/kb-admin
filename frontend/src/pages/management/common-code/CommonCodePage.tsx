import React, { useState, useEffect } from 'react';
import { Grid, Paper, Stack, Typography, Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import EditableList from '@/components/common/list/EditableList';
import MediumButton from '@/components/common/button/MediumButton';
import type { CodeTypeOption } from '@/mocks/commonCodeDb';
import { majorColumns, minorColumns } from './components/columns';
import MajorCodeForm from './components/MajorCodeForm';
import MinorCodeForm from './components/MinorCodeForm';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import type { RowItem } from './types';
import {
  useCodeTypes,
  useSaveCodeTypes,
  useCommonCodes,
  useCreateCommonCode,
  useUpdateCommonCode,
  useDeleteCommonCode,
} from './hooks';

export default function CommonCodePage() {
  const { showAlert } = useAlertDialog();

  // React Query 훅 사용
  const {
    data: codeTypesData,
    isLoading: isMajorLoading,
    refetch: refetchCodeTypes,
  } = useCodeTypes();
  const saveCodeTypesMutation = useSaveCodeTypes();
  const createCommonCodeMutation = useCreateCommonCode();
  const updateCommonCodeMutation = useUpdateCommonCode();
  const deleteCommonCodeMutation = useDeleteCommonCode();

  // State for Major Codes (Code Types)
  const [selectedMajor, setSelectedMajor] = useState<CodeTypeOption | null>(null);
  const [isMajorFormOpen, setIsMajorFormOpen] = useState(false);
  const [isNewMajor, setIsNewMajor] = useState(false);

  // State for Minor Codes (Common Code Items)
  const {
    data: minorCodesData,
    isLoading: isMinorLoading,
    refetch: refetchMinorCodes,
  } = useCommonCodes(selectedMajor ? { codeType: selectedMajor.value } : undefined);
  const [selectedMinor, setSelectedMinor] = useState<RowItem | null>(null);
  const [isMinorFormOpen, setIsMinorFormOpen] = useState(false);
  const [isNewMinor, setIsNewMinor] = useState(false);

  // majorList와 minorList를 React Query 데이터에서 가져오기
  const majorList = codeTypesData || [];
  const minorList =
    minorCodesData?.map((item, index) => ({
      ...item,
      no: index + 1,
    })) || [];

  // Handle Major Code Selection
  const handleMajorRowClick = (params: any) => {
    const item = params.row as CodeTypeOption;
    setSelectedMajor(item);
    setSelectedMinor(null); // Reset minor selection
    setIsMajorFormOpen(true);
    setIsNewMajor(false);
    setIsMinorFormOpen(false); // Close minor form
  };

  // selectedMajor가 변경될 때 minorCodes 자동 refetch
  useEffect(() => {
    if (selectedMajor) {
      refetchMinorCodes();
    }
  }, [selectedMajor, refetchMinorCodes]);

  // Handle Minor Code Selection
  const handleMinorRowClick = (params: any) => {
    const item = params.row as RowItem;
    setSelectedMinor(item);
    setIsMinorFormOpen(true);
    setIsNewMinor(false);
  };

  // Major Code Actions
  const handleAddMajor = () => {
    setSelectedMajor(null);
    setIsNewMajor(true);
    setIsMajorFormOpen(true);
    setSelectedMinor(null);
    setIsMinorFormOpen(false);
  };

  const handleSaveMajor = async (data: CodeTypeOption) => {
    try {
      let newMajorList;
      if (isNewMajor) {
        // Check for duplicate ID
        if (majorList.some((item) => item.value === data.value)) {
          showAlert({
            title: '알림',
            message: '이미 존재하는 코드 타입 ID입니다.',
            severity: 'warning',
          });
          return;
        }
        newMajorList = [...majorList, data];
      } else {
        newMajorList = majorList.map((item) => (item.value === data.value ? data : item));
      }

      // API 호출
      await saveCodeTypesMutation.mutateAsync(newMajorList);
      setIsMajorFormOpen(false);
      setIsNewMajor(false);

      // If it was a new item, select it
      if (isNewMajor) {
        setSelectedMajor(data);
      }

      // Show success alert
      showAlert({
        title: '성공',
        message: '대분류가 저장되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to save code type:', error);
      showAlert({
        title: '오류',
        message: '대분류 저장 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const handleDeleteMajor = async (value: string) => {
    try {
      const newMajorList = majorList.filter((item) => item.value !== value);
      await saveCodeTypesMutation.mutateAsync(newMajorList);
      setSelectedMajor(null);
      setIsMajorFormOpen(false);
    } catch (error) {
      console.error('Failed to delete code type:', error);
      showAlert({
        title: '오류',
        message: '대분류 삭제 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  // Minor Code Actions
  const handleAddMinor = () => {
    if (!selectedMajor) {
      showAlert({
        title: '알림',
        message: '먼저 대분류(코드 타입)를 선택해주세요.',
        severity: 'warning',
      });
      return;
    }
    setSelectedMinor(null);
    setIsNewMinor(true);
    setIsMinorFormOpen(true);
  };

  const handleSaveMinor = async (data: RowItem) => {
    try {
      if (isNewMinor) {
        // API 생성 호출
        await createCommonCodeMutation.mutateAsync({
          ...data,
          code_type: selectedMajor!.value,
        });
      } else {
        // API 수정 호출
        await updateCommonCodeMutation.mutateAsync({
          serviceCode: data.service_cd,
          data,
        });
      }
      setIsMinorFormOpen(false);
      setIsNewMinor(false);

      // Show success alert
      showAlert({
        title: '성공',
        message: '소분류가 저장되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to save common code:', error);
      showAlert({
        title: '오류',
        message: '소분류 저장 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const handleDeleteMinor = async (service_cd: string) => {
    try {
      await deleteCommonCodeMutation.mutateAsync(service_cd);
      setSelectedMinor(null);
      setIsMinorFormOpen(false);

      showAlert({
        title: '성공',
        message: '소분류가 삭제되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to delete common code:', error);
      showAlert({
        title: '오류',
        message: '소분류 삭제 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <PageHeader
        title="공통코드 관리"
        breadcrumbs={[{ label: '관리' }, { label: '공통코드 관리' }]}
      />

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Left Panel: Major Codes (Code Types) */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">대분류 (코드 타입)</Typography>
              <MediumButton variant="contained" onClick={handleAddMajor}>
                추가
              </MediumButton>
            </Stack>

            <Box sx={{ flex: 1, minHeight: 0, mb: 2 }}>
              <EditableList
                columns={majorColumns}
                rows={majorList}
                isLoading={isMajorLoading}
                onRowClick={handleMajorRowClick}
                rowIdGetter={(row) => row.value}
                autoHeight={false}
              />
            </Box>
          </Paper>

          {isMajorFormOpen && (
            <Box sx={{ mt: 2 }}>
              <MajorCodeForm
                selectedItem={isNewMajor ? null : selectedMajor}
                isNew={isNewMajor}
                onSave={handleSaveMajor}
                onCancel={() => setIsMajorFormOpen(false)}
                onDelete={handleDeleteMajor}
              />
            </Box>
          )}
        </Grid>

        {/* Right Panel: Minor Codes (Items) */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                소분류 {selectedMajor ? `(${selectedMajor.label})` : ''}
              </Typography>
              <MediumButton variant="contained" onClick={handleAddMinor} disabled={!selectedMajor}>
                추가
              </MediumButton>
            </Stack>

            <Box sx={{ flex: 1, minHeight: 0, mb: 2 }}>
              {selectedMajor ? (
                <EditableList
                  columns={minorColumns}
                  rows={minorList}
                  isLoading={isMinorLoading}
                  onRowClick={handleMinorRowClick}
                  rowIdGetter={(row) => row.service_cd}
                  autoHeight={false}
                />
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  대분류를 선택해주세요
                </Box>
              )}
            </Box>
          </Paper>

          {isMinorFormOpen && selectedMajor && (
            <Box sx={{ mt: 2 }}>
              <MinorCodeForm
                selectedItem={isNewMinor ? null : selectedMinor}
                isNew={isNewMinor}
                selectedCodeType={selectedMajor.value}
                onSave={handleSaveMinor}
                onCancel={() => setIsMinorFormOpen(false)}
                onDelete={handleDeleteMinor}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
}
