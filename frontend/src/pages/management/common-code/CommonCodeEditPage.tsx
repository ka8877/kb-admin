import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Stack } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { GridColDef, useGridApiRef } from '@mui/x-data-grid';
import type { RowItem } from './types';
import { CommonCodeValidator } from './validation';
import { CODE_TYPE_LABELS } from './components/columns';
import PageHeader from '@/components/common/PageHeader';
import AddDataButton from '@/components/common/actions/AddDataButton';
import SelectionDeleteButton from '@/components/common/actions/SelectionDeleteButton';
import { DeleteConfirmBar } from '@/components/common/actions/ListActions';
import CreateDataActions from '@/components/common/actions/CreateDataActions';
import { ManagedCategoryList } from '@/components/common/list/CategoryList';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { ROUTES } from '@/routes/menu';
import { commonCodeMockDb } from '@/mocks/commonCodeDb';
import { ALERT_MESSAGES } from '@/constants/message';

type LocalRow = RowItem & { isNew?: boolean };
type CategoryRowGeneric = Record<string, unknown>;

const CommonCodeEditPage: React.FC = () => {
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
      {
        field: 'code_type',
        headerName: '코드 타입',
        width: 180,
        editable: true,
        type: 'singleSelect',
        valueOptions: ['SERVICE_NAME', 'QUESTION_CATEGORY', 'AGE_GROUP'],
        valueFormatter: (params) =>
          CODE_TYPE_LABELS[params.value as keyof typeof CODE_TYPE_LABELS] || params.value,
      },
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

    commonCodeMockDb.listAll().then((data) => {
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
      newRow.service_cd !== oldRow.service_cd ||
      newRow.code_type !== oldRow.code_type;

    if (changed) modifiedRef.current.add(newRow.no);

    return newRow;
  }, []);

  const handleAddRow = useCallback(() => {
    const currentMax = rows.reduce((m, r) => Math.max(m, r.no ?? 0), 0);
    const tempNo = currentMax + 1;
    const newRow: LocalRow = {
      no: tempNo,
      code_type: 'SERVICE_NAME',
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
  }, [rows, apiRef, columns]);

  const handleRowOrderChange = useCallback((reorderedRows: CategoryRowGeneric[]) => {
    const updated = reorderedRows.map((r, i) => ({ ...(r as LocalRow), no: i + 1 }));
    setRows(updated);
    orderModifiedRef.current = true;

    for (const r of updated) {
      if (!r.isNew) {
        modifiedRef.current.add(r.no);
      }
    }
  }, []);

  const handleCancel = useCallback(() => {
    navigate(ROUTES.COMMON_CODE);
  }, [navigate]);

  const handleSave = useCallback(async () => {
    const validator = new CommonCodeValidator();
    const modifiedRows = rows.filter(
      (r) => modifiedRef.current.has(r.no) || orderModifiedRef.current,
    );

    for (const row of modifiedRows) {
      const errors = validator.validate(row);
      if (errors.length > 0) {
        for (const err of errors) {
          showAlert({ message: err, severity: 'error' });
        }
        return;
      }
    }

    try {
      const promises = modifiedRows.map((r) => {
        if (r.isNew) {
          return commonCodeMockDb.create({
            code_type: r.code_type,
            category_nm: r.category_nm,
            service_cd: r.service_cd,
            status_code: r.status_code,
          });
        } else {
          return commonCodeMockDb.update(r.service_cd, {
            code_type: r.code_type,
            category_nm: r.category_nm,
            service_cd: r.service_cd,
            status_code: r.status_code,
          });
        }
      });

      await Promise.all(promises);

      if (orderModifiedRef.current) {
        await commonCodeMockDb.reorder(rows.map((r) => r.no));
      }

      showAlert({ message: '저장되었습니다.' });
      navigate(ROUTES.COMMON_CODE);
    } catch (error) {
      console.error('Save error:', error);
      showAlert({ message: '오류가 발생했습니다.', severity: 'error' });
    }
  }, [rows, navigate, showAlert]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev);
    setSelectionModel([]);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectionModel.length === 0) return;

    try {
      await Promise.all(
        selectionModel.map((id) => {
          const row = rows.find((r) => r.no === id);
          if (row) {
            return commonCodeMockDb.delete(row.service_cd);
          }
          return Promise.resolve();
        }),
      );

      const remaining = rows.filter((r) => !selectionModel.includes(r.no));
      const renumbered = remaining.map((r, i) => ({ ...r, no: i + 1 }));
      setRows(renumbered);
      setSelectionModel([]);
      setSelectionMode(false);

      showAlert({ message: '삭제되었습니다.' });
    } catch (error) {
      console.error('Delete error:', error);
      showAlert({ message: '오류가 발생했습니다.', severity: 'error' });
    }
  }, [selectionModel, rows, showAlert]);

  return (
    <Box>
      <PageHeader title="공통 코드 관리" />

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AddDataButton onClick={handleAddRow}>추가</AddDataButton>
          <SelectionDeleteButton
            selectionMode={selectionMode}
            onToggleSelection={setSelectionMode}
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
        rows={rows as any}
        setRows={setRows as any}
        getRowId={(row: any) => row.no}
        columns={columns as any}
        loading={loading}
        processRowUpdate={processRowUpdate as any}
        selectionMode={selectionMode}
        selectionModel={selectionModel}
        onSelectionModelChange={setSelectionModel}
        onDragOrderChange={handleRowOrderChange}
      />

      <DeleteConfirmBar
        open={selectionMode}
        selectedIds={selectionModel}
        onConfirm={handleDelete}
        onCancel={() => setSelectionMode(false)}
        size="small"
      />
    </Box>
  );
};

export default CommonCodeEditPage;
