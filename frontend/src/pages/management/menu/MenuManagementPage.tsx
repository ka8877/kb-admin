// frontend/src/pages/management/menu/MenuManagementPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import MediumButton from '@/components/common/button/MediumButton';
import { menuMockDb } from '@/mocks/menuDb';
import SimpleList from '@/components/common/list/SimpleList';
import MenuForm from './components/MenuForm';
import { menuColumns } from './components/columns';
import type { MenuScreenItem, RowItem } from './types';

const MenuManagementPage: React.FC = () => {
  const [rows, setRows] = useState<RowItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuScreenItem | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);

  const loadData = useCallback(async () => {
    const data = await menuMockDb.listAll();
    const rowData: RowItem[] = data.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
    setRows(rowData);
    return rowData;
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRowClick = useCallback((params: { row: RowItem }) => {
    setSelectedMenu(params.row);
    setIsNewMode(false);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedMenu(null);
    setIsNewMode(true);
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedMenu(null);
    setIsNewMode(false);
  }, []);

  const handleSave = useCallback(
    async (menuItem: MenuScreenItem) => {
      try {
        if (isNewMode) {
          // 중복 체크
          const allMenus = await menuMockDb.listAll();
          const isDuplicate = allMenus.some((m) => m.screen_id === menuItem.screen_id);

          if (isDuplicate) {
            alert('이미 존재하는 화면 ID입니다.');
            return;
          }

          await menuMockDb.create({
            screen_id: menuItem.screen_id,
            screen_name: menuItem.screen_name,
            path: menuItem.path,
            depth: menuItem.depth,
            order: menuItem.order,
            parent_screen_id: menuItem.parent_screen_id,
            screen_type: menuItem.screen_type,
            display_yn: menuItem.display_yn,
          });
          alert('메뉴가 추가되었습니다.');
        } else {
          await menuMockDb.update(menuItem.id, {
            screen_name: menuItem.screen_name,
            path: menuItem.path,
            depth: menuItem.depth,
            order: menuItem.order,
            parent_screen_id: menuItem.parent_screen_id,
            screen_type: menuItem.screen_type,
            display_yn: menuItem.display_yn,
          });
          alert('메뉴가 수정되었습니다.');
        }

        // 데이터 다시 로드
        const updatedRows = await loadData();
        setRows(updatedRows);
        setSelectedMenu(null);
        setIsNewMode(false);
      } catch (error) {
        console.error('Save error:', error);
        alert('저장 중 오류가 발생했습니다.');
      }
    },
    [isNewMode, loadData],
  );

  const handleDelete = useCallback(
    async (id: string | number) => {
      try {
        await menuMockDb.delete(id);
        alert('메뉴가 삭제되었습니다.');
        const updatedRows = await loadData();
        setRows(updatedRows);
        setSelectedMenu(null);
        setIsNewMode(false);
      } catch (error) {
        console.error('Delete error:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    },
    [loadData],
  );

  return (
    <Box>
      <PageHeader title="메뉴 관리" />

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* 좌측: 메뉴 목록 */}
        <Grid item xs={12} md={7}>
          <SimpleList<RowItem>
            columns={menuColumns}
            rows={rows}
            rowIdGetter="id"
            defaultPageSize={10}
            onRowClick={handleRowClick}
            enableClientSearch={false}
            enableStatePreservation={false}
            autoHeight={false}
            actionsNode={
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                <MediumButton
                  variant="contained"
                  onClick={handleAddNew}
                  sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                >
                  추가 +
                </MediumButton>
              </Box>
            }
          />
        </Grid>

        {/* 우측: 메뉴 상세 정보 */}
        <Grid item xs={12} md={5}>
          {selectedMenu || isNewMode ? (
            <MenuForm
              menuItem={selectedMenu}
              allMenuItems={rows}
              isNew={isNewMode}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          ) : (
            <Box
              sx={{
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                메뉴를 선택하거나 추가 버튼을 클릭하세요
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default MenuManagementPage;
