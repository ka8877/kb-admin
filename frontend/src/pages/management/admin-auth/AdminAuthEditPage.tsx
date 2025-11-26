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
import { adminAuthMockDb } from '@/mocks/adminAuthDb';
import { permissionMockDb } from '@/mocks/permissionDb';
import { ALERT_MESSAGES } from '@/constants/message';

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

  const modifiedRef = useRef<Set<number>>(new Set());
  const hasFocusedRef = useRef(false);

  // Load permission options
  useEffect(() => {
    permissionMockDb.listAll().then((permissions) => {
      const options = permissions.filter((p) => p.status === '활성').map((p) => p.permission_id);
      setPermissionOptions(options);
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
    [apiRef],
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
    [renderEmployeeSearchCell, permissionOptions],
  );

  // Load data
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    adminAuthMockDb.listAll().then((data) => {
      if (!mounted) return;
      setRows(data as LocalRow[]);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const processRowUpdate = useCallback((newRow: LocalRow, oldRow: LocalRow) => {
    setRows((prev) => prev.map((r) => (r.no === oldRow.no ? newRow : r)));

    const changed =
      newRow.user_name !== oldRow.user_name ||
      newRow.position !== oldRow.position ||
      newRow.team_1st !== oldRow.team_1st ||
      newRow.team_2nd !== oldRow.team_2nd ||
      newRow.use_permission !== oldRow.use_permission ||
      newRow.approval_permission !== oldRow.approval_permission ||
      newRow.status !== oldRow.status;

    if (changed) modifiedRef.current.add(newRow.no);

    return newRow;
  }, []);

  const handleAddRow = useCallback(() => {
    const currentMax = rows.reduce((m, r) => Math.max(m, r.no ?? 0), 0);
    const tempNo = currentMax + 1;
    const newRow: LocalRow = {
      no: tempNo,
      id: tempNo,
      user_name: '',
      position: '',
      team_1st: '',
      team_2nd: '',
      use_permission: 'VIEWER',
      approval_permission: '요청자',
      status: '활성',
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
            } catch (e) {
              // ignore
            }
          }, 0);
        }
      } catch (e) {
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
          const validationResult = AdminAuthValidator.validateAll({
            user_name: row.user_name,
            position: row.position,
            team_1st: row.team_1st,
            team_2nd: row.team_2nd,
            use_permission: row.use_permission,
            approval_permission: row.approval_permission,
            status: row.status,
          });

          if (!validationResult.isValid) {
            validationErrors.push(`${row.no}번 행: ${validationResult.errors.join(', ')}`);
          }
        });

        // Validation 실패 시
        if (validationErrors.length > 0) {
          const hasControlChar = validationErrors.some((err) =>
            err.includes('알 수 없는 제어 문자'),
          );
          const hasMissingField = validationErrors.some((err) => err.includes('필수입니다'));

          if (hasControlChar) {
            await showAlert({
              message: ALERT_MESSAGES.VALIDATION_CONTROL_CHAR,
              severity: 'error',
            });
          } else if (hasMissingField) {
            await showAlert({
              message: ALERT_MESSAGES.VALIDATION_MISSING_REQUIRED,
              severity: 'error',
            });
          } else {
            await showAlert({
              message: validationErrors.join('\n'),
              severity: 'error',
            });
          }
          setLoading(false);
          return;
        }

        // Validation 성공 시 저장
        await Promise.all(
          ids.map(async (id) => {
            const row = rows.find((r) => r.no === id);
            if (!row) return null;

            if (row.isNew) {
              await adminAuthMockDb.create({
                user_name: row.user_name,
                position: row.position,
                team_1st: row.team_1st,
                team_2nd: row.team_2nd,
                use_permission: row.use_permission,
                approval_permission: row.approval_permission,
                status: row.status,
              });
            } else {
              await adminAuthMockDb.update(row.id, row);
            }
          }),
        );
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
  }, [rows, navigate, showAlert]);

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

      for (const id of nos) {
        const row = rows.find((r) => r.no === Number(id));
        if (!row) continue;

        if (row.isNew) {
          setRows((prev) => prev.filter((r) => r.no !== row.no));
        } else {
          await adminAuthMockDb.delete(row.id);
          setRows((prev) => prev.filter((r) => r.id !== row.id));
        }
      }

      setSelectionModel([]);
      setSelectionMode(false);
      setLoading(false);
    },
    [rows],
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
              <MediumButton variant="outlined" onClick={handleCancel} size="small">
                취소
              </MediumButton>
              <MediumButton variant="contained" onClick={handleSave} size="small">
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
          ghostLabelGetter={(r) => ({ title: r.user_name, subtitle: r.position })}
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
