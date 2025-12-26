// frontend/src/pages/management/admin-auth/AdminAuthEditPage.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack } from '@mui/material';
import { GridColDef, useGridApiRef, GridRenderEditCellParams } from '@mui/x-data-grid';
import type { RowItem } from './types';
import { AdminAuthValidator } from './validation/adminAuthValidation';
import EmployeeSearchCell from './components/EmployeeSearchCell';
import PageHeader from '@/components/common/PageHeader';
import AddDataActions from '@/components/common/actions/AddDataActions';
import SelectionDeleteActions from '@/components/common/actions/SelectionDeleteActions';
import { DeleteConfirmBar } from '@/components/common/actions/ListActions';
import MediumButton from '@/components/common/button/MediumButton';
import CategoryList from '@/components/common/list/CategoryList';
import Section from '@/components/layout/Section';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { ROUTES } from '@/routes/menu';
import { ALERT_MESSAGES } from '@/constants/message';
import { fetchAdminAuthList, bulkSaveUsers, bulkRemoveUsers } from './api';
import { fetchPermissions as fetchPermissionList } from '../permission/api';

type LocalRow = RowItem & { isNew?: boolean };

const AdminAuthEditPage: React.FC = () => {
  const navigate = useNavigate();
  const apiRef = useGridApiRef();
  const { showAlert } = useAlertDialog();

  const [rows, setRows] = useState<LocalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const [permissionOptions, setPermissionOptions] = useState<string[]>([]);
  const [permissionNameByCode, setPermissionNameByCode] = useState<Record<string, string>>({});
  const [allowedPermissionCodes, setAllowedPermissionCodes] = useState<Set<string>>(new Set());
  const [permissionCodeByName, setPermissionCodeByName] = useState<Record<string, string>>({});

  const modifiedRef = useRef<Set<number>>(new Set());

  // Load permission options
  useEffect(() => {
    fetchPermissionList().then((permissions) => {
      const active = permissions.filter((p) => p.status === '활성');
      const options = active.map((p) => p.permission_id);
      const nameMap: Record<string, string> = {};
      const reverseNameToCode: Record<string, string> = {};
      active.forEach((p) => {
        nameMap[p.permission_id] = p.permission_name;
        reverseNameToCode[String(p.permission_name).toUpperCase()] = String(
          p.permission_id
        ).toUpperCase();
      });
      setPermissionOptions(options);
      setPermissionNameByCode(nameMap);
      const codeSet = new Set<string>();
      active.forEach((p) => {
        const up = String(p.permission_id).toUpperCase();
        codeSet.add(up);
      });
      setAllowedPermissionCodes(codeSet);
      setPermissionCodeByName(reverseNameToCode);
    });
  }, []);

  const renderEmployeeSearchCell = useCallback(
    (params: GridRenderEditCellParams) => (
      <EmployeeSearchCell
        key={`${params.id}-${params.field}-${params.value}`}
        value={params.value as string}
        onChange={(employee) => {
          if (employee && apiRef.current) {
            // 행 데이터 업데이트
            const updatedRow = {
              ...params.row,
              user_name: employee.user_name,
              position: employee.position,
              team_1st: employee.team_1st,
              team_2nd: employee.team_2nd,
            };

            // DataGrid 내부 상태와 rows state 모두 업데이트
            apiRef.current.updateRows([updatedRow]);
            setRows((prevRows) => prevRows.map((r) => (r.no === params.row.no ? updatedRow : r)));
            modifiedRef.current.add(params.row.no);

            // 편집 모드 종료
            setTimeout(() => {
              apiRef.current?.stopCellEditMode({
                id: params.id,
                field: params.field,
                ignoreModifications: true,
              });
            }, 0);
          }
        }}
        onClose={() => {
          // 편집 모드 종료는 onChange에서 처리
        }}
      />
    ),
    [apiRef]
  );

  const columns: GridColDef<LocalRow>[] = useMemo(
    () => [
      { field: 'no', headerName: 'No', width: 80, editable: false },
      {
        field: 'user_name',
        headerName: '사용자명',
        width: 150,
        editable: true,
        renderEditCell: renderEmployeeSearchCell,
      },
      { field: 'position', headerName: '직책', width: 120, editable: true },
      { field: 'team_1st', headerName: '1차팀', width: 150, editable: true },
      { field: 'team_2nd', headerName: '2차팀', width: 150, editable: true },
      {
        field: 'use_permission',
        headerName: '이용권한',
        width: 150,
        editable: true,
        type: 'singleSelect',
        valueOptions: permissionOptions,
        valueFormatter: (params) =>
          permissionNameByCode[String(params.value)] ?? String(params.value),
      },
      {
        field: 'approval_permission',
        headerName: '결재권한',
        width: 120,
        editable: true,
        type: 'singleSelect',
        valueOptions: ['요청자', '결재자'],
      },
      {
        field: 'status',
        headerName: '활성여부',
        width: 100,
        editable: true,
        type: 'singleSelect',
        valueOptions: ['활성', '비활성'],
      },
    ],
    [renderEmployeeSearchCell, permissionOptions, permissionNameByCode]
  );

  // Load data
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchAdminAuthList().then((data) => {
      if (!mounted) return;
      setRows(data.items as LocalRow[]);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const processRowUpdate = useCallback((newRow: LocalRow, oldRow: LocalRow) => {
    setRows((prev) => prev.map((r) => (r.no === oldRow.no ? newRow : r)));

    const changed =
      newRow.username !== oldRow.username ||
      newRow.empName !== oldRow.empName ||
      newRow.deptName !== oldRow.deptName ||
      newRow.email !== oldRow.email ||
      JSON.stringify(newRow.roleCodes) !== JSON.stringify(oldRow.roleCodes) ||
      newRow.isActive !== oldRow.isActive;

    if (changed) modifiedRef.current.add(newRow.no);

    return newRow;
  }, []);

  const handleAddRow = useCallback(() => {
    const currentMax = rows.reduce((m, r) => Math.max(m, r.no ?? 0), 0);
    const tempNo = currentMax + 1;
    const newRow: LocalRow = {
      no: tempNo,
      kcUserId: null as any,
      username: '',
      email: '',
      empNo: '',
      empName: '',
      deptName: '',
      roleCodes: ['ROLE_VIEWER'],
      isActive: true,
      isNew: true,
    };
    setRows((prev) => [newRow, ...prev]);
    modifiedRef.current.add(tempNo);

    setTimeout(() => {
      try {
        const editableCol = columns.find((c) => c.editable);
        if (editableCol && apiRef.current) {
          apiRef.current.setCellFocus(newRow.no, editableCol.field as string);
          setTimeout(() => {
            try {
              if (apiRef.current) {
                apiRef.current.startCellEditMode({
                  id: newRow.no,
                  field: editableCol.field as string,
                });
              }
            } catch (_e) {
              // ignore
            }
          }, 0);
        }
      } catch (_e) {
        // ignore
      }
    }, 0);
  }, [rows, columns, apiRef]);

  const handleCancel = useCallback(() => navigate(ROUTES.ADMIN_AUTH), [navigate]);

  const handleSave = useCallback(async () => {
    setLoading(true);

    try {
      const ids = Array.from(modifiedRef.current);

      if (ids.length > 0) {
        // Validation 실행
        const validationErrors: string[] = [];
        const rowsToValidate = rows.filter((r) => ids.includes(r.no));

        rowsToValidate.forEach((row) => {
          // 기본 validation
          if (!row.username || !row.email) {
            validationErrors.push(`${row.no}번 행: 사용자명과 이메일은 필수입니다.`);
          }

          if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
            validationErrors.push(`${row.no}번 행: 올바른 이메일 형식이 아닙니다.`);
          }

          if (!row.roleCodes || row.roleCodes.length === 0) {
            validationErrors.push(`${row.no}번 행: 최소 1개의 권한을 선택해야 합니다.`);
          }
        });

        // Validation 실패 시
        if (validationErrors.length > 0) {
          await showAlert({
            message: validationErrors.join('\n'),
            severity: 'error',
          });
          setLoading(false);
          return;
        }

        // Validation 성공 시 bulk save
        const itemsToSave = rowsToValidate.map((row) => ({
          kcUserId: row.isNew ? undefined : row.kcUserId,
          username: row.username,
          email: row.email,
          empNo: row.empNo || '',
          isActive: row.isActive,
          roleCodes: row.roleCodes,
        }));

        await bulkSaveUsers(itemsToSave as any);
      }

      modifiedRef.current.clear();
      navigate(ROUTES.ADMIN_AUTH);
    } catch (error) {
      console.error('Save error:', error);
      await showAlert({
        message: ALERT_MESSAGES.ERROR_OCCURRED,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [rows, navigate, showAlert, bulkSaveUsers]);

  const handleSelectionModelChange = useCallback((newModel: (string | number)[]) => {
    setSelectionModel(newModel);
  }, []);

  const handleToggleSelection = useCallback((next: boolean) => {
    setSelectionMode(next);
    if (!next) setSelectionModel([]);
  }, []);

  const handleDeleteConfirm = useCallback(
    async (ids: string | number | (string | number)[]) => {
      setLoading(true);
      const nos = Array.isArray(ids) ? ids : [ids];

      const rowsToDelete = rows.filter((r) => nos.includes(r.no));
      const newRows = rowsToDelete.filter((r) => r.isNew);
      const existingRows = rowsToDelete.filter((r) => !r.isNew && r.kcUserId);

      // 새로 추가된 행은 로컬에서만 삭제
      if (newRows.length > 0) {
        setRows((prev) => prev.filter((r) => !newRows.some((nr) => nr.no === r.no)));
      }

      // 기존 데이터는 API 호출
      if (existingRows.length > 0) {
        try {
          const kcUserIds = existingRows
            .map((r) => r.kcUserId)
            .filter((id): id is number => id !== undefined);
          await bulkRemoveUsers(kcUserIds);
          setRows((prev) => prev.filter((r) => !existingRows.some((er) => er.no === r.no)));
        } catch {
          await showAlert({
            message: '사용자 삭제에 실패했습니다.',
            severity: 'error',
          });
        }
      }

      setSelectionModel([]);
      setSelectionMode(false);
      setLoading(false);
    },
    [rows, bulkRemoveUsers, showAlert]
  );

  return (
    <Box>
      <PageHeader title="사용자 관리 편집" />

      <Section>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AddDataActions onClick={handleAddRow}>추가</AddDataActions>
            <SelectionDeleteActions
              selectionMode={selectionMode}
              onToggleSelection={handleToggleSelection}
              size="small"
            />
          </Stack>

          {!selectionMode && (
            <Stack direction="row" spacing={1}>
              <MediumButton variant="outlined" onClick={handleCancel} size="small" subType="etc">
                취소
              </MediumButton>
              <MediumButton variant="contained" onClick={handleSave} size="small" subType="u">
                저장
              </MediumButton>
            </Stack>
          )}
        </Stack>

        <CategoryList<LocalRow>
          apiRef={apiRef}
          columns={columns}
          rows={rows}
          setRows={setRows}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(err) => console.error('Row update error', err)}
          getRowId={(row) => row.no}
          selectionMode={selectionMode}
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelectionModelChange}
          loading={loading}
          isCellEditable={(params) => params.field !== 'no'}
          defaultPageSize={25}
          ghostLabelGetter={(r) => ({ title: r.username, subtitle: r.empName })}
        />

        <DeleteConfirmBar
          open={selectionMode}
          selectedIds={selectionModel}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setSelectionMode(false)}
        />
      </Section>
    </Box>
  );
};

export default AdminAuthEditPage;
