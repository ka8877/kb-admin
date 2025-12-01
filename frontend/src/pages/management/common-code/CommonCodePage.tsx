import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Paper, Stack, Typography, Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import EditableList from '@/components/common/list/EditableList';
import MediumButton from '@/components/common/button/MediumButton';
import { commonCodeMockDb, type CodeTypeOption } from '@/mocks/commonCodeDb';
import { majorColumns, minorColumns } from './components/columns';
import MajorCodeForm from './components/MajorCodeForm';
import MinorCodeForm from './components/MinorCodeForm';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import type { RowItem } from './types';

export default function CommonCodePage() {
  const { showAlert } = useAlertDialog();
  // State for Major Codes (Code Types)
  const [majorList, setMajorList] = useState<CodeTypeOption[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<CodeTypeOption | null>(null);
  const [isMajorLoading, setIsMajorLoading] = useState(false);
  const [isMajorFormOpen, setIsMajorFormOpen] = useState(false);
  const [isNewMajor, setIsNewMajor] = useState(false);

  // State for Minor Codes (Common Code Items)
  const [minorList, setMinorList] = useState<RowItem[]>([]);
  const [selectedMinor, setSelectedMinor] = useState<RowItem | null>(null);
  const [isMinorLoading, setIsMinorLoading] = useState(false);
  const [isMinorFormOpen, setIsMinorFormOpen] = useState(false);
  const [isNewMinor, setIsNewMinor] = useState(false);

  // Load Major Codes (Code Types)
  const loadMajorCodes = useCallback(async () => {
    setIsMajorLoading(true);
    try {
      const data = await commonCodeMockDb.getCodeTypes();
      setMajorList(data);
    } catch (error) {
      console.error('Failed to load code types:', error);
    } finally {
      setIsMajorLoading(false);
    }
  }, []);

  // Load Minor Codes (Items for selected Code Type)
  const loadMinorCodes = useCallback(async (codeType: string) => {
    setIsMinorLoading(true);
    try {
      const allItems = await commonCodeMockDb.listAll();
      const filteredItems = allItems.filter((item) => item.code_type === codeType);

      // Renumber 'no' to start from 1 for each category
      const renumberedItems = filteredItems.map((item, index) => ({
        ...item,
        no: index + 1,
      }));

      setMinorList(renumberedItems as RowItem[]);
    } catch (error) {
      console.error('Failed to load common codes:', error);
    } finally {
      setIsMinorLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMajorCodes();
  }, [loadMajorCodes]);

  // Handle Major Code Selection
  const handleMajorRowClick = (params: any) => {
    const item = params.row as CodeTypeOption;
    setSelectedMajor(item);
    setSelectedMinor(null); // Reset minor selection
    setIsMajorFormOpen(true);
    setIsNewMajor(false);
    setIsMinorFormOpen(false); // Close minor form
    loadMinorCodes(item.value);
  };

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
      await commonCodeMockDb.saveCodeTypes(newMajorList);
      await loadMajorCodes();
      setIsMajorFormOpen(false);
      setIsNewMajor(false);

      // If it was a new item, select it
      if (isNewMajor) {
        setSelectedMajor(data);
        loadMinorCodes(data.value);
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
      await commonCodeMockDb.saveCodeTypes(newMajorList);
      await loadMajorCodes();
      setSelectedMajor(null);
      setMinorList([]);
      setIsMajorFormOpen(false);
    } catch (error) {
      console.error('Failed to delete code type:', error);
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
        await commonCodeMockDb.create({
          ...data,
          code_type: selectedMajor!.value,
        });
      } else {
        await commonCodeMockDb.update(data.service_cd, data);
      }
      await loadMinorCodes(selectedMajor!.value);
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
      await commonCodeMockDb.delete(service_cd);
      if (selectedMajor) {
        await loadMinorCodes(selectedMajor.value);
      }
      setSelectedMinor(null);
      setIsMinorFormOpen(false);
    } catch (error) {
      console.error('Failed to delete common code:', error);
    }
  };

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <PageHeader title="공통코드 관리" locations={['관리', '공통코드 관리']} />

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
                loading={isMajorLoading}
                onRowClick={handleMajorRowClick}
                rowIdGetter={(row) => row.value}
                hideFooter
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
                  loading={isMinorLoading}
                  onRowClick={handleMinorRowClick}
                  rowIdGetter={(row) => row.service_cd}
                  hideFooter
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
