// frontend/src/pages/management/admin-auth/AdminAuthEditPage.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import AddDataButton from '../../../components/common/actions/AddDataButton';
import SelectionDeleteButton from '../../../components/common/actions/SelectionDeleteButton';
import { DeleteConfirmBar } from '../../../components/common/actions/ListActions';
import MediumButton from '../../../components/common/button/MediumButton';
import { GridColDef, useGridApiRef, GridRenderEditCellParams } from '@mui/x-data-grid';
import CategoryList from '../../../components/common/list/CategoryList';
import { adminAuthMockDb } from '../../../mocks/adminAuthDb';
import type { RowItem } from './types';
import { ROUTES } from '../../../routes/menu';
import EmployeeSearchCell from './components/EmployeeSearchCell';
import { AdminAuthValidator } from './validation';
import { useAlertDialog } from '../../../hooks/useAlertDialog';

const AdminAuthEditPage: React.FC = () => {
  const navigate = useNavigate();
  const apiRef = useGridApiRef();
  const { showAlert } = useAlertDialog();

  type LocalRow = RowItem & { isNew?: boolean };

  const [rows, setRows] = useState<LocalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);

  const modifiedRef = useRef<Set<number>>(new Set());
  const hasFocusedRef = useRef(false);

  const columns: GridColDef<LocalRow>[] = useMemo(
    () => [
      { field: 'no', headerName: 'No', width: 80, editable: false },
      {
        field: 'user_name',
        headerName: '사용자명',
        width: 150,
        editable: true,
        renderEditCell: (params: GridRenderEditCellParams) => (
          <EmployeeSearchCell
            value={params.value as string}
            onChange={(employee) => {
              if (employee && apiRef.current) {
                // 먼저 편집 모드 종료
                apiRef.current.stopCellEditMode({ id: params.id, field: params.field });

                // 행 데이터 직접 업데이트
                setTimeout(() => {
                  setRows((prevRows) =>
                    prevRows.map((r) =>
                      r.no === params.row.no
                        ? {
                            ...r,
                            user_name: employee.user_name,
                            position: employee.position,
                            team_1st: employee.team_1st,
                            team_2nd: employee.team_2nd,
                          }
                        : r,
                    ),
                  );
                  modifiedRef.current.add(params.row.no);
                }, 0);
              }
            }}
            onClose={() => {
              // onChange에서 이미 편집 모드를 종료했으므로 여기서는 안전하게 확인 후 종료
              if (apiRef.current) {
                try {
                  const editMode = apiRef.current.getCellMode(params.id, params.field);
                  if (editMode === 'edit') {
                    apiRef.current.stopCellEditMode({ id: params.id, field: params.field });
                  }
                } catch (e) {
                  // 이미 편집 모드가 아닌 경우 무시
                }
              }
            }}
          />
        ),
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
        valueOptions: ['admin', 'crud', 'viewer'],
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
    [],
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
      use_permission: 'viewer',
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
              message:
                '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
            });
          } else if (hasMissingField) {
            await showAlert({ message: '필수 정보가 누락되었습니다. 확인 후 작성해주세요.' });
          } else {
            await showAlert({ message: validationErrors.join('\n') });
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
      await showAlert({ message: '에러가 발생하였습니다. 다시 시도해주세요.' });
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
      <PageHeader title="어드민 권한관리 편집" />

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 2, mb: 1 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AddDataButton onClick={handleAddRow}>추가</AddDataButton>
          <SelectionDeleteButton
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

      <CategoryList
        apiRef={apiRef}
        columns={columns}
        rows={rows}
        setRows={setRows}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(err) => console.error('Row update error', err)}
        getRowId={(row: LocalRow) => row.no}
        selectionMode={selectionMode}
        selectionModel={selectionModel}
        onSelectionModelChange={handleSelectionModelChange}
        loading={loading}
        isCellEditable={(params: any) => params.field !== 'no'}
        defaultPageSize={25}
        ghostLabelGetter={(r: LocalRow) => ({ title: r.user_name, subtitle: r.position })}
      />

      <DeleteConfirmBar
        open={selectionMode}
        selectedIds={selectionModel}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSelectionMode(false)}
      />
    </Box>
  );
};

export default AdminAuthEditPage;
