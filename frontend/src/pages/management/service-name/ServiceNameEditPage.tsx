import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Stack, IconButton } from '@mui/material';
import AddDataButton from '../../../components/common/actions/AddDataButton';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CreateDataActions from '../../../components/common/actions/CreateDataActions';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { serviceNameMockDb } from '../../../mocks/serviceNameDb';
import type { RowItem } from './types';
import { ROUTES } from '../../../routes/menu';

const ServiceNameEditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiRef = useGridApiRef();

  type LocalRow = RowItem & { isNew?: boolean };
  const [rows, setRows] = useState<LocalRow[]>([]);
  const [loading, setLoading] = useState(false);

  // track modified rows by numeric `no`
  const modifiedRef = useRef<Set<number>>(new Set());
  // mark if order was changed by drag/reorder
  const orderModifiedRef = useRef(false);
  // temp negative id counter for newly added rows
  const tempNoRef = useRef<number>(-1);
  const [draggingNo, setDraggingNo] = useState<number | null>(null);
  const [dragOverNo, setDragOverNo] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [orderChanged, setOrderChanged] = useState(false);

  // handle mousemove / mouseup for simple drag-reorder (mousedown initiated)
  useEffect(() => {
    if (draggingNo == null) return;

    const onMove = (e: MouseEvent) => {
      // update ghost position and highlight target row but do NOT reorder yet
      setDragPos({ x: e.clientX, y: e.clientY });
      const el = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest('[data-id]') as HTMLElement | null;
      if (!el) return;
      const idStr = el.getAttribute('data-id');
      if (!idStr) return;
      const id = Number(idStr);
      if (Number.isNaN(id)) return;
      setDragOverNo(id);
    };

    const onUp = (e: MouseEvent) => {
      // on mouseup, calculate the element under the pointer and perform reorder there
      try {
        const el = document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest('[data-id]') as HTMLElement | null;
        let targetNo: number | null = null;
        if (el) {
          const idStr = el.getAttribute('data-id');
          if (idStr) {
            const id = Number(idStr);
            if (!Number.isNaN(id)) targetNo = id;
          }
        }

        const fromNo = draggingNo;
        if (fromNo != null && targetNo != null && fromNo !== targetNo) {
          setRows((prev) => {
            const copy = [...prev];
            const from = copy.findIndex((r) => r.no === fromNo);
            const to = copy.findIndex((r) => r.no === targetNo);
            if (from === -1) return prev;
            // if target not found (shouldn't happen), append to end
            const resolvedTo = to === -1 ? copy.length : to;
            const [item] = copy.splice(from, 1);
            // insert at target index so the dragged item occupies the target's position
            const insertIndex = resolvedTo;
            copy.splice(insertIndex, 0, item);
            return copy;
          });
          setOrderChanged(true);
          orderModifiedRef.current = true;
        }
      } catch (err) {
        // ignore
      } finally {
        setDraggingNo(null);
        setDragPos(null);
        setDragOverNo(null);
        try {
          document.body.style.userSelect = '';
        } catch (_err) {
          // ignore
        }
      }

      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      try {
        document.body.style.userSelect = '';
      } catch (_err) {
        // ignore
      }
    };
  }, [draggingNo]);

  const columns: GridColDef<LocalRow>[] = useMemo(
    () => [
      {
        field: 'drag',
        headerName: '',
        width: 48,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          return (
            <div
              data-drag-handle
              style={{ cursor: 'grab', display: 'flex', alignItems: 'center', height: '100%' }}
            >
              <DragIndicatorIcon fontSize="small" />
            </div>
          );
        },
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

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await serviceNameMockDb.listAll();
      setRows(data as LocalRow[]);
      setLoading(false);
    })();
  }, []);

  // If an id query param (service_cd) is present, focus that row's first editable cell after rows load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focusServiceCd = params.get('id');
    if (!focusServiceCd) return;

    const t = setTimeout(() => {
      try {
        const editableCol = columns.find((c) => c.editable);
        if (editableCol && apiRef.current) {
          const target = rows.find((r) => r.service_cd === focusServiceCd);
          if (!target) return;
          apiRef.current.setCellFocus(target.no, editableCol.field as string);
          setTimeout(() => {
            try {
              apiRef.current.startCellEditMode({
                id: target.no,
                field: editableCol.field as string,
              });
            } catch (e) {
              // ignore
            }
          }, 60);
        }
      } catch (e) {
        // ignore
      }
    }, 160);

    return () => clearTimeout(t);
  }, [location.search, apiRef, rows, columns]);

  const processRowUpdate = useCallback((newRow: LocalRow, oldRow: LocalRow) => {
    setRows((prev) => prev.map((r) => (r.no === oldRow.no ? (newRow as LocalRow) : r)));

    // detect meaningful changes
    const changed =
      newRow.category_nm !== oldRow.category_nm ||
      newRow.status_code !== oldRow.status_code ||
      newRow.service_cd !== oldRow.service_cd;

    if (changed) modifiedRef.current.add(newRow.no);

    return newRow as LocalRow;
  }, []);

  const handleAddRow = () => {
    // assign a positive temporary `no` as current max + 1 so UI shows a natural index
    const currentMax = rows.reduce((m, r) => Math.max(m, r.no ?? 0), 0);
    const tempNo = currentMax + 1;
    const newRow: LocalRow = {
      no: tempNo,
      category_nm: '',
      service_cd: '',
      status_code: 'Y',
      isNew: true,
    };
    // show the new row at the top for immediate editing but give it a natural positive no
    setRows((prev) => [newRow, ...prev]);
    modifiedRef.current.add(tempNo);

    setTimeout(() => {
      try {
        const editableCol = columns.find((c) => c.editable) as GridColDef | undefined;
        if (editableCol && apiRef.current) {
          apiRef.current.setCellFocus(newRow.no, editableCol.field as string);
          setTimeout(
            () =>
              apiRef.current.startCellEditMode({
                id: newRow.no,
                field: editableCol.field as string,
              }),
            60,
          );
        }
      } catch (e) {
        // ignore
      }
    }, 80);
  };

  const handleCancel = () => navigate(ROUTES.SERVICE_NAME);

  const handleSave = async () => {
    setLoading(true);
    const ids = Array.from(modifiedRef.current);
    if (ids.length > 0) {
      await Promise.all(
        ids.map(async (id) => {
          const row = rows.find((r) => r.no === id) as LocalRow | undefined;
          if (!row) return null;
          if (row.isNew) {
            const created = await serviceNameMockDb.create({
              category_nm: row.category_nm,
              service_cd: row.service_cd,
              status_code: row.status_code,
            });
            // replace temp row (matched by temp no) and move the created item to the end
            setRows((prev) => {
              const withoutTemp = prev.filter((r) => r.no !== id);
              return [...withoutTemp, created];
            });
            return created;
          }
          return serviceNameMockDb.update(row.service_cd, row);
        }),
      );
    }
    // if order changed, persist new numbering on save
    if (orderModifiedRef.current || orderChanged) {
      try {
        // capture current display order
        const before = [...rows];
        // prepare updates for persisted rows whose `no` would change
        const updates = before
          .map((r, idx) => ({ row: r, newNo: idx + 1 }))
          .filter((x) => !x.row.isNew && x.row.no !== x.newNo);

        await Promise.all(
          updates.map((u) => serviceNameMockDb.update(u.row.service_cd, { no: u.newNo })),
        );

        // apply new nos in UI
        setRows((prev) => prev.map((r, idx) => ({ ...r, no: idx + 1 })));
      } catch (e) {
        // ignore reorder errors for now
        console.error('Failed to persist order', e);
      }
    }

    modifiedRef.current.clear();
    orderModifiedRef.current = false;
    setOrderChanged(false);
    setLoading(false);
    navigate(ROUTES.SERVICE_NAME);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <AddDataButton onClick={handleAddRow}>추가</AddDataButton>
        </Box>

        <CreateDataActions
          onSave={handleSave}
          onCancel={handleCancel}
          size="small"
          saveVariant="contained"
          cancelVariant="outlined"
          spacing={1}
          sx={{ mb: 0 }}
        />
      </Stack>

      <div
        style={{ height: 600, width: '100%' }}
        onMouseDown={(e) => {
          // only start drag when clicking the drag handle
          const handle = (e.target as HTMLElement).closest(
            '[data-drag-handle]',
          ) as HTMLElement | null;
          if (!handle) return;
          const rowEl = (handle as HTMLElement).closest('[data-id]') as HTMLElement | null;
          if (!rowEl) return;
          const idStr = rowEl.getAttribute('data-id');
          if (!idStr) return;
          const id = Number(idStr);
          if (Number.isNaN(id)) return;
          setDraggingNo(id);
          // clear any previous hover
          setDragOverNo(id);
          setDragPos({ x: e.clientX, y: e.clientY });
          // prevent text selection while dragging
          try {
            document.body.style.userSelect = 'none';
          } catch (_err) {
            // ignore
          }
        }}
      >
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          getRowId={(r: LocalRow) => r.no}
          columns={columns}
          loading={loading}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(err) => console.error('Row update error', err)}
          isCellEditable={(params) =>
            params.field === 'service_cd' ||
            params.field === 'category_nm' ||
            params.field === 'status_code'
          }
          disableRowSelectionOnClick
          getRowClassName={(params) => {
            if (params.id === dragOverNo) return 'drag-over';
            if (params.id === draggingNo) return 'dragging';
            return '';
          }}
          sx={{
            '& .drag-over': { bgcolor: 'action.selected' },
            '& .dragging': { opacity: 0.7 },
          }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </div>
      {/* floating ghost for dragged row (shows the held row while dragging) */}
      {draggingNo != null && dragPos != null
        ? (() => {
            const row = rows.find((r) => r.no === draggingNo);
            if (!row) return null;
            return (
              <div
                style={{
                  position: 'fixed',
                  left: dragPos.x + 12,
                  top: dragPos.y + 12,
                  pointerEvents: 'none',
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.12)',
                  padding: '6px 10px',
                  borderRadius: 6,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                  zIndex: 1400,
                  minWidth: 200,
                }}
              >
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>No {row.no}</div>
                <div style={{ fontWeight: 600 }}>{row.category_nm || '카테고리'}</div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>{row.service_cd}</div>
              </div>
            );
          })()
        : null}
    </Box>
  );
};

export default ServiceNameEditPage;
