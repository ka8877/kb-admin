import React from 'react';
import { Box, Grid, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import MediumButton from '@/components/common/button/MediumButton';
import Section from '@/components/layout/Section';

type ManagementListDetailLayoutProps = {
  title: string;
  addButtonText?: string;
  emptyStateText?: string;
  onAddNew: () => void;
  listNode: React.ReactNode;
  detailNode: React.ReactNode;
  showDetail: boolean;
  disabled?: boolean;
  gridRatio?: { left: number; right: number };
  headerActions?: React.ReactNode;
};

/**
 * 관리 페이지의 공통 레이아웃 컴포넌트
 * 좌측 리스트, 우측 상세 폼 구조를 제공
 */
const ManagementListDetailLayout: React.FC<ManagementListDetailLayoutProps> = ({
  title,
  addButtonText = '추가',
  emptyStateText = '항목을 선택하거나 추가 버튼을 클릭하세요',
  onAddNew,
  listNode,
  detailNode,
  showDetail,
  disabled = false,
  gridRatio = { left: 7, right: 5 },
  headerActions,
}) => {
  return (
    <Box>
      <PageHeader title={title} />
      <Section>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {headerActions || <Box />}
          <MediumButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddNew}
            disabled={disabled}
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
            subType="c"
          >
            {addButtonText}
          </MediumButton>
        </Box>
        <Grid container spacing={2}>
          {/* 좌측: 리스트 */}
          <Grid item xs={12} md={gridRatio.left}>
            {listNode}
          </Grid>

          {/* 우측: 상세 폼 */}
          <Grid item xs={12} md={gridRatio.right}>
            {showDetail ? (
              detailNode
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                {emptyStateText}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Section>
    </Box>
  );
};

export default ManagementListDetailLayout;
