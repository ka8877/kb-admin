import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Stack } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { GridColDef, useGridApiRef } from '@mui/x-data-grid';
import type { RowItem } from './types';
import { ServiceNameValidator } from './validation';
import PageHeader from '@/components/common/PageHeader';
import AddDataButton from '@/components/common/actions/AddDataButton';
import SelectionDeleteButton from '@/components/common/actions/SelectionDeleteButton';
import { DeleteConfirmBar } from '@/components/common/actions/ListActions';
import CreateDataActions from '@/components/common/actions/CreateDataActions';
import { ManagedCategoryList } from '@/components/common/list/CategoryList';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { ROUTES } from '@/routes/menu';
import { serviceNameMockDb } from '@/mocks/serviceNameDb';
import { ALERT_MESSAGES } from '@/constants/message';

type LocalRow = RowItem & { isNew?: boolean };
type CategoryRowGeneric = Record<string, unknown>;

const ServiceNameEditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiRef = useGridApiRef();
  const { showAlert } = useAlertDialog();

  const [rows, setRows] = useState<LocalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);

  const modifiedRef = useRef<Set<number>>(new Set());
  const orderModifiedRef = useRef(false);
  const hasFocusedRef = useRef(false);

  const columns: GridColDef<LocalRow>[] = useMemo(
    () => [
      {
        field: 'drag',
        headerName: '',
        width: 48,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: () => (
          <div
            data-drag-handle
            style={{ cursor: 'grab', display: 'flex', alignItems: 'center', height: '100%' }}
          >
            <DragIndicatorIcon fontSize="small" />
          </div>
        ),
      },
      { field: 'no', headerName: 'No', width: 80, editable: false },
      { field: 'category_nm', headerName: '카테고리명', flex: 1, editable: true },
      { field: 'service_cd', headerName: '서비스코드', width: 200, editable: true },
      {
        field: 'status_code',
        headerName: '활성상태',
        width: 140,
        editable: true,
        type: 'singleSelect',
        valueOptions: ['Y', 'N'],
        valueFormatter: (params) => (params.value === 'Y' ? '활성' : '비활성'),
      },
    ],
    [],
  );

  // Load data and handle focus/edit
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    serviceNameMockDb.listAll().then((data) => {
      if (!mounted) return;

      setRows(data as LocalRow[]);
      setLoading(false);

      // Handle focus after data is loaded (only once)
      if (hasFocusedRef.current) return;

      const params = new URLSearchParams(location.search);
      const focusServiceCd = params.get('id');
      if (!focusServiceCd) return;

      hasFocusedRef.current = true;
      setTimeout(() => {
        const target = (data as LocalRow[]).find((r) => r.service_cd === focusServiceCd);
        const editableCol = columns.find((c) => c.editable);
        if (!target || !editableCol || !apiRef.current) return;

        try {
          apiRef.current.setCellFocus(target.no, editableCol.field as string);
          setTimeout(() => {
            try {
              if (apiRef.current) {
                apiRef.current.startCellEditMode({
                  id: target.no,
                  field: editableCol.field as string,
                });
              }
            } catch (e) {
              // ignore
            }
          }, 0);
        } catch (e) {
          // ignore
        }
      }, 0);
    });

    return () => {
      mounted = false;
    };
  }, [location.search, apiRef, columns]);

  const processRowUpdate = useCallback((newRow: LocalRow, oldRow: LocalRow) => {
    setRows((prev) => prev.map((r) => (r.no === oldRow.no ? newRow : r)));

    const changed =
      newRow.category_nm !== oldRow.category_nm ||
      newRow.status_code !== oldRow.status_code ||
      newRow.service_cd !== oldRow.service_cd;

    if (changed) modifiedRef.current.add(newRow.no);

    return newRow;
  }, []);

  const handleAddRow = useCallback(() => {
    const currentMax = rows.reduce((m, r) => Math.max(m, r.no ?? 0), 0);
    const tempNo = currentMax + 1;
    const newRow: LocalRow = {
      no: tempNo,
      category_nm: '',
      service_cd: '',
      status_code: 'Y',
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

  const handleCancel = useCallback(() => navigate(ROUTES.SERVICE_NAME), [navigate]);

  const handleSave = useCallback(async () => {
    setLoading(true);

    try {
      const ids = Array.from(modifiedRef.current);

      if (ids.length > 0) {
        // Validation 실행
        const validationErrors: string[] = [];
        const rowsToValidate = rows.filter((r) => ids.includes(r.no));

        rowsToValidate.forEach((row) => {
          const validationResult = ServiceNameValidator.validateAll({
            category_nm: row.category_nm,
            service_cd: row.service_cd,
            status_code: row.status_code,
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
        const updates = await Promise.all(
          ids.map(async (id) => {
            const row = rows.find((r) => r.no === id);
            if (!row) return null;

            if (row.isNew) {
              const created = await serviceNameMockDb.create({
                category_nm: row.category_nm,
                service_cd: row.service_cd,
                status_code: row.status_code,
              });
              return { type: 'create' as const, tempNo: id, created };
            }

            await serviceNameMockDb.update(row.service_cd, row);
            return { type: 'update' as const };
          }),
        );

        const createdItems = updates.filter((u) => u?.type === 'create');
        if (createdItems.length > 0) {
          setRows((prev) => {
            let updated = [...prev];
            createdItems.forEach((item) => {
              if (item?.created) {
                updated = updated.filter((r) => r.no !== item.tempNo);
                updated.push(item.created as LocalRow);
              }
            });
            return updated;
          });
        }
      }

      if (orderModifiedRef.current) {
        try {
          const order = rows.map((r) => r.service_cd).filter(Boolean) as string[];
          const reordered = await serviceNameMockDb.reorder(order);
          setRows(reordered as LocalRow[]);
        } catch (e) {
          console.error('Failed to persist order', e);
        }
      }

      modifiedRef.current.clear();
      orderModifiedRef.current = false;
      setLoading(false);
      navigate(ROUTES.SERVICE_NAME);
    } catch (error) {
      console.error('Save error:', error);
      await showAlert({
        message: ALERT_MESSAGES.ERROR_OCCURRED,
        severity: 'error',
      });
      setLoading(false);
    }
  }, [rows, navigate, showAlert]);

  const handleDragOrderChange = useCallback((newRows: LocalRow[]) => {
    setRows(newRows);
    orderModifiedRef.current = true;
  }, []);

  const handleSelectionModelChange = useCallback((newModel: (string | number)[]) => {
    setSelectionModel(newModel);
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
          await serviceNameMockDb.delete(row.service_cd);
          setRows((prev) => prev.filter((r) => r.service_cd !== row.service_cd));
        }
      }

      setSelectionModel([]);
      setSelectionMode(false);
      setLoading(false);
    },
    [rows],
  );

  const handleDeleteCancel = useCallback(() => {
    setSelectionMode(false);
    setSelectionModel([]);
  }, []);

  const handleToggleSelection = useCallback((next: boolean) => {
    setSelectionMode(next);
    if (!next) setSelectionModel([]);
  }, []);

  return (
    <Box>
      <PageHeader title="서비스명 카테고리 관리" />

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AddDataButton onClick={handleAddRow}>추가</AddDataButton>
          <SelectionDeleteButton
            selectionMode={selectionMode}
            onToggleSelection={handleToggleSelection}
            size="small"
          />
        </Stack>

        {!selectionMode && (
          <CreateDataActions
            onSave={handleSave}
            onCancel={handleCancel}
            size="small"
            saveVariant="contained"
            cancelVariant="outlined"
            spacing={1}
            sx={{ mb: 0 }}
          />
        )}
      </Stack>

      <ManagedCategoryList
        apiRef={apiRef}
        rows={rows as CategoryRowGeneric[]}
        setRows={
          setRows as (
            updater: CategoryRowGeneric[] | ((prev: CategoryRowGeneric[]) => CategoryRowGeneric[]),
          ) => void
        }
        getRowId={(r) => (r as LocalRow).no}
        columns={columns as GridColDef<CategoryRowGeneric>[]}
        loading={loading}
        processRowUpdate={
          processRowUpdate as unknown as (
            newRow: CategoryRowGeneric,
            oldRow: CategoryRowGeneric,
          ) => CategoryRowGeneric | Promise<CategoryRowGeneric>
        }
        selectionMode={selectionMode}
        selectionModel={selectionModel}
        onSelectionModelChange={handleSelectionModelChange}
        onDragOrderChange={handleDragOrderChange as (newRows: CategoryRowGeneric[]) => void}
      />

      <DeleteConfirmBar
        open={selectionMode}
        selectedIds={selectionModel}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        size="small"
      />
    </Box>
  );
};

export default ServiceNameEditPage;
