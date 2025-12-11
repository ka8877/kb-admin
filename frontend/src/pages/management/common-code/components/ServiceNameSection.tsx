import React, { useState, useEffect, useMemo } from 'react';
import { Box, Autocomplete, TextField, Stack } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import Section from '@/components/layout/Section';
import MediumButton from '@/components/common/button/MediumButton';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { ALERT_TITLES, TOAST_MESSAGES } from '@/constants/message';
import {
  useCodeItems,
  useServiceMappings,
  useUpsertServiceMapping,
  useDeleteServiceMapping,
} from '../hooks';
import type { CodeItemDisplay, ServiceMapping } from '../types';

/**
 * 서비스명 설정 섹션
 * service_nm(코드아이템) ↔ service_cd(코드아이템) 1:1 매핑
 * parent: service_nm, child: service_cd
 */
export default function ServiceNameSection() {
  const { showAlert } = useAlertDialog();

  // service_cd 그룹의 코드아이템 목록 조회
  const { data: allCodeItems = [] } = useCodeItems();
  const serviceCodeItems = allCodeItems.filter((item) => item.group_code === 'service_cd');
  const serviceNameItems = allCodeItems.filter((item) => item.group_code === 'service_nm');
  const { data: serviceMappings = [], isLoading } = useServiceMappings();
  const upsertMappingMutation = useUpsertServiceMapping();
  const deleteMappingMutation = useDeleteServiceMapping();

  const [editingValues, setEditingValues] = useState<Record<string | number, string>>({});
  const [editingRows, setEditingRows] = useState<Set<string | number>>(new Set());

  // service_nm 그룹의 코드명 목록 (자동완성용)
  const existingServiceNames = useMemo(() => {
    const names = serviceNameItems.map((item) => ({
      label: item.code_name,
      value: item.firebaseKey || item.code_item_id.toString(),
    }));
    return names;
  }, [serviceNameItems]);

  // 서비스 매핑 데이터와 코드아이템 조인
  const rows: GridRowsProp = useMemo(() => {
    return serviceCodeItems.map((item, index) => {
      // child_code_item_id가 현재 item의 firebaseKey와 일치하는 매핑 찾기
      const mapping = serviceMappings.find((m) => m.child_code_item_id === item.firebaseKey);

      // parent_code_item_id로 service_nm 찾기
      const serviceNameItem = mapping
        ? serviceNameItems.find((sn) => sn.firebaseKey === mapping.parent_code_item_id)
        : null;

      return {
        id: item.firebaseKey || item.code_item_id,
        no: index + 1,
        service_code: item.code,
        service_code_name: item.code_name,
        service_name_item_id: serviceNameItem?.firebaseKey || null,
        service_name: serviceNameItem?.code_name || '',
        firebaseKey: mapping?.firebaseKey || null,
        itemFirebaseKey: item.firebaseKey,
        is_active: item.is_active,
      };
    });
  }, [serviceCodeItems, serviceMappings, serviceNameItems]);

  // rows가 변경될 때마다 editingValues와 editingRows 동기화
  useEffect(() => {
    const newValues: Record<string | number, string> = {};
    const newEditingRows = new Set<string | number>();

    rows.forEach((row) => {
      newValues[row.id] = row.service_name_item_id?.toString() || '';

      // 서비스명이 없으면 편집 모드
      if (!row.service_name_item_id) {
        newEditingRows.add(row.id);
      }
    });

    setEditingValues(newValues);
    setEditingRows(newEditingRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceMappings]); // rows 대신 serviceMappings를 의존성으로 사용

  const handleServiceNameChange = (serviceCodeItemId: string | number, value: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [serviceCodeItemId]: value,
    }));
  };

  const handleSave = async (serviceCodeItemId: string | number) => {
    const serviceNameItemIdStr = editingValues[serviceCodeItemId]?.trim();

    if (!serviceNameItemIdStr) {
      showAlert({
        title: ALERT_TITLES.NOTIFICATION,
        message: '서비스명을 선택해주세요.',
        severity: 'warning',
      });
      return;
    }

    const row = rows.find((r) => r.id === serviceCodeItemId);
    if (!row) return;

    // firebaseKey를 parent/child로 사용
    const parentFirebaseKey = serviceNameItemIdStr; // service_nm의 firebaseKey
    const childFirebaseKey = row.itemFirebaseKey; // service_cd의 firebaseKey

    const payload = {
      mapping_type: 'SERVICE' as const,
      parent_code_item_id: parentFirebaseKey, // service_nm의 firebaseKey를 ID로 사용
      child_code_item_id: childFirebaseKey, // service_cd의 firebaseKey를 ID로 사용
      sort_order: 0,
      is_active: 1,
      firebaseKey: row.firebaseKey || undefined,
    };

    try {
      await upsertMappingMutation.mutateAsync(payload);

      // 저장 성공 시 편집 모드 해제
      setEditingRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(serviceCodeItemId);
        return newSet;
      });

      showAlert({
        title: ALERT_TITLES.SUCCESS,
        message: TOAST_MESSAGES.CODE_ITEM_UPDATED,
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to save service name:', error);
      showAlert({
        title: ALERT_TITLES.ERROR,
        message: '서비스명 저장에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  const handleEdit = (serviceCodeItemId: string | number) => {
    setEditingRows((prev) => new Set(prev).add(serviceCodeItemId));
  };

  const handleDelete = async (serviceCodeItemId: string | number) => {
    const row = rows.find((r) => r.id === serviceCodeItemId);
    if (!row || !row.firebaseKey) {
      showAlert({
        title: ALERT_TITLES.NOTIFICATION,
        message: '삭제할 매핑 정보가 없습니다.',
        severity: 'warning',
      });
      return;
    }

    try {
      await deleteMappingMutation.mutateAsync(row.firebaseKey);

      showAlert({
        title: ALERT_TITLES.SUCCESS,
        message: '서비스명 매핑이 삭제되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to delete service mapping:', error);
      showAlert({
        title: ALERT_TITLES.ERROR,
        message: '서비스명 삭제에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'no',
      headerName: 'No',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'service_code',
      headerName: '서비스코드',
      width: 200,
    },
    {
      field: 'service_code_name',
      headerName: '코드명',
      width: 200,
    },
    {
      field: 'service_name',
      headerName: '서비스명',
      width: 350,
      renderCell: (params) => {
        const isEditing = editingRows.has(params.row.id);

        if (isEditing) {
          return (
            <Autocomplete
              options={existingServiceNames}
              value={
                existingServiceNames.find(
                  (opt) => opt.value.toString() === editingValues[params.row.id],
                ) || null
              }
              onChange={(event, newValue) => {
                handleServiceNameChange(params.row.id, newValue?.value.toString() || '');
              }}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="서비스명 선택"
                  sx={{ my: 0.5 }}
                  autoFocus
                />
              )}
              ListboxProps={{
                style: { maxHeight: '200px' },
              }}
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 4],
                      },
                    },
                  ],
                },
              }}
              componentsProps={{
                paper: {
                  sx: {
                    width: '380px',
                  },
                },
              }}
              fullWidth
            />
          );
        }

        return <Box sx={{ py: 1 }}>{params.row.service_name || '-'}</Box>;
      },
    },
    {
      field: 'is_active',
      headerName: '사용여부',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (params.value === 0 ? '미사용' : '사용'),
    },
    {
      field: 'actions',
      headerName: '',
      width: 200,
      align: 'right',
      headerAlign: 'center',
      renderCell: (params) => {
        const isEditing = editingRows.has(params.row.id);

        if (isEditing) {
          return (
            <MediumButton
              variant="contained"
              size="small"
              onClick={() => handleSave(params.row.id)}
              disabled={upsertMappingMutation.isPending}
            >
              저장
            </MediumButton>
          );
        }

        return (
          <Stack direction="row" spacing={1}>
            <MediumButton variant="outlined" size="small" onClick={() => handleEdit(params.row.id)}>
              수정
            </MediumButton>
            {params.row.firebaseKey && (
              <MediumButton
                variant="outlined"
                size="small"
                color="error"
                onClick={() => handleDelete(params.row.id)}
                disabled={deleteMappingMutation.isPending}
              >
                삭제
              </MediumButton>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <Section title="서비스명 설정">
      <Box sx={{ height: 'calc(100vh - 300px)', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooter
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1,
            },
          }}
        />
      </Box>
    </Section>
  );
}
