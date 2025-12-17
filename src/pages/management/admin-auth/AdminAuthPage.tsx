// frontend/src/pages/management/admin-auth/AdminAuthPage.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack } from '@mui/material';
import ExcelJS from 'exceljs';
import PageHeader from '@/components/common/PageHeader';
import EditableList from '@/components/common/list/EditableList';
import MediumButton from '@/components/common/button/MediumButton';
import Section from '@/components/layout/Section';
import { ROUTES } from '@/routes/menu';
import { listColumns } from './components/columns';
import type { RowItem } from './types';
import { fetchAdminAuthList } from './api';

const AdminAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchAdminAuthList()
      .then((rows) => setData(rows))
      .finally(() => setIsLoading(false));
  }, []);

  const handleEdit = useCallback(() => {
    navigate(`${ROUTES.ADMIN_AUTH}/edit`);
  }, [navigate]);

  const handleRowClick = useCallback(
    (params: { id: string | number; row: RowItem }) => {
      navigate(`${ROUTES.ADMIN_AUTH}/detail/${params.row.id}`);
    },
    [navigate]
  );

  const handleDownloadAll = useCallback(async () => {
    if (!data.length) return;

    // columns의 field와 headerName 매핑 생성
    const columnMap = new Map<string, string>();
    listColumns.forEach((col) => {
      columnMap.set(col.field, col.headerName || col.field);
    });

    // 헤더 생성 (columns 순서대로, headerName 사용)
    const orderedFields = listColumns.map((col) => col.field);
    const headers = orderedFields.map((field) => columnMap.get(field) || field);

    // ExcelJS 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // 헤더 행 추가
    const headerRow = worksheet.addRow(headers);

    // 헤더 스타일 적용
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }, // 파란색
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }, // 흰색
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
    });

    // 데이터 행 추가
    data.forEach((row) => {
      const rowData = orderedFields.map((field) => {
        const rowObj = row as Record<string, unknown>;
        const value = rowObj[field];
        return value ?? '';
      });
      worksheet.addRow(rowData);
    });

    // 열 너비 자동 조정
    worksheet.columns = orderedFields.map((field, idx) => {
      // 헤더 길이
      const headerLength = (headers[idx] || '').length;
      // 데이터 최대 길이
      const maxDataLength = Math.max(
        ...data.map((row) => {
          const rowObj = row as Record<string, unknown>;
          const value = rowObj[field];
          return String(value ?? '').length;
        }),
        0
      );
      // 헤더와 데이터 중 더 긴 것 기준으로 너비 설정 (최소 10, 최대 50)
      const width = Math.min(Math.max(headerLength, maxDataLength, 10), 50);
      return { width };
    });

    // 파일명: 어드민권한관리_{YYYYMMDD_HHmmss}.xlsx
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHmmss
    const fileName = `어드민권한관리_${dateStr}_${timeStr}.xlsx`;

    // 파일 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  return (
    <Box>
      <PageHeader title="사용자 관리" />
      <Section>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1}>
            <MediumButton variant="contained" onClick={handleEdit} subType="u">
              편집
            </MediumButton>
          </Stack>
          <Stack direction="row" spacing={1}>
            <MediumButton variant="outlined" onClick={handleDownloadAll} subType="etc">
              전체목록 xlsx 다운로드
            </MediumButton>
          </Stack>
        </Box>
        <EditableList
          columns={listColumns}
          rows={data}
          rowIdGetter={(r: RowItem) => r.id}
          defaultPageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={handleRowClick}
          isEditMode={false}
          isLoading={isLoading}
        />
      </Section>
    </Box>
  );
};

export default AdminAuthPage;
