import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { GridColDef, useGridApiRef } from '@mui/x-data-grid';
import type { RowItem } from './types';
import { CommonCodeValidator } from './validation';
import { CODE_TYPE_LABELS } from './components/columns';
import PageHeader from '@/components/common/PageHeader';
import AddDataActions from '@/components/common/actions/AddDataActions';
import SelectionDeleteActions from '@/components/common/actions/SelectionDeleteActions';
import { DeleteConfirmBar } from '@/components/common/actions/ListActions';
import CreateDataActions from '@/components/common/actions/CreateDataActions';
import { ManagedCategoryList } from '@/components/common/list/CategoryList';
import Section from '@/components/layout/Section';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { ROUTES } from '@/routes/menu';
import { commonCodeMockDb, CodeType, CodeTypeOption } from '@/mocks/commonCodeDb';
import { ALERT_MESSAGES } from '@/constants/message';

type LocalRow = RowItem & { isNew?: boolean };
type CategoryRowGeneric = Record<string, unknown>;

const CommonCodeEditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiRef = useGridApiRef();
  const { showAlert } = useAlertDialog();

  // location.state에서 codeType 가져오기
  const initialCodeType = (location.state as { codeType?: CodeType })?.codeType || '';

  const [rows, setRows] = useState<LocalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const [selectedCodeType, setSelectedCodeType] = useState<CodeType | ''>('');
  const [codeTypeOptions, setCodeTypeOptions] = useState<CodeTypeOption[]>([
    { value: 'SERVICE_NAME', label: '서비스명' },
    { value: 'QUESTION_CATEGORY', label: '질문 카테고리' },
    { value: 'AGE_GROUP', label: '연령대' },
  ]);

  const modifiedRef = useRef<Set<number>>(new Set());
  const orderModifiedRef = useRef(false);
  const hasFocusedRef = useRef(false);

  // 코드 타입 옵션 로드 및 초기 선택값 설정
  React.useEffect(() => {
    commonCodeMockDb.getCodeTypes().then((options) => {
      setCodeTypeOptions(options);
      // 옵션이 로드된 후에 초기값 설정
      if (initialCodeType) {
        setSelectedCodeType(initialCodeType);
      }
    });
  }, [initialCodeType]);

  // 필터링된 rows (코드 타입별로 NO 재계산)
  const filteredRows = useMemo(() => {
    if (!selectedCodeType) {
      return [];
    }
    const filtered = rows.filter((row) => row.code_type === selectedCodeType);
    // 필터링된 결과에서 NO를 1번부터 재계산
    return filtered.map((row, index) => ({
      ...row,
      display_no: index + 1,
    }));
  }, [rows, selectedCodeType]);

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
      {
        field: 'display_no',
        headerName: 'No',
        width: 80,
        editable: false,
        valueGetter: (params) => params.row.display_no || params.row.no,
      },
      {
        field: 'code_type',
        headerName: '코드 타입',
        width: 150,
        editable: false,
        valueFormatter: (params) =>
          CODE_TYPE_LABELS[params.value as keyof typeof CODE_TYPE_LABELS] || params.value,
      },
      { field: 'category_nm', headerName: '카테고리명', width: 200, editable: true },
      { field: 'service_cd', headerName: '코드', width: 250, editable: true },
      {
        field: 'status_code',
        headerName: '활성여부',
        width: 120,
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

    if (changed) {
      modifiedRef.current.add(newRow.no);
      // service_cd가 변경된 경우, 원래 service_cd를 저장해둠
      if (newRow.service_cd !== oldRow.service_cd && !newRow.isNew) {
        // @ts-ignore - 임시로 original_service_cd 저장
        newRow.original_service_cd = oldRow.service_cd;
      }
    }

    return newRow;
  }, []);

  const handleAddRow = useCallback(() => {
    if (!selectedCodeType) {
      showAlert({ message: '코드 타입을 선택해주세요.', severity: 'error' });
      return;
    }

    const currentMax = rows.reduce((m, r) => Math.max(m, r.no ?? 0), 0);
    const tempNo = currentMax + 1;
    const newRow: LocalRow = {
      no: tempNo,
      code_type: selectedCodeType,
      category_nm: '',
      service_cd: '',
      status_code: 'Y',
      isNew: true,
    };
    setRows((prev) => [newRow, ...prev]);
    modifiedRef.current.add(tempNo);

    setTimeout(() => {
      try {
        const editableCol = columns.find((c) => c.editable && c.field !== 'code_type');
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
  }, [rows, selectedCodeType, columns, apiRef, showAlert]);

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
    navigate(ROUTES.COMMON_CODE_TEMP);
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
          // service_cd가 변경된 경우 original_service_cd 사용
          // @ts-ignore
          const targetServiceCd: string = r.original_service_cd || r.service_cd;
          return commonCodeMockDb.update(targetServiceCd, {
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
      navigate(ROUTES.COMMON_CODE_TEMP);
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

  const handleCodeTypeChange = useCallback((event: SelectChangeEvent<CodeType | ''>) => {
    setSelectedCodeType(event.target.value as CodeType | '');
  }, []);

  return (
    <Box>
      <PageHeader title="공통 코드 관리 임시" />

      <Section>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="code-type-select-label-edit">코드 타입</InputLabel>
              <Select
                labelId="code-type-select-label-edit"
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
            <AddDataActions onClick={handleAddRow}>추가</AddDataActions>
            <SelectionDeleteActions
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
          rows={filteredRows as any}
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
      </Section>
    </Box>
  );
};

export default CommonCodeEditPage;
