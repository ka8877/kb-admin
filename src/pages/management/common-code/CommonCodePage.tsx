import React, { useState, useCallback } from 'react';
import { Grid, Stack, Tabs, Tab, Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import type { CodeGroupDisplay } from './types';
import CodeGroupSection from './components/CodeGroupSection';
import CodeItemSection from './components/CodeItemSection';
import QuestionMappingSection from './components/QuestionMappingSection';

// 스타일 정의
const styles = {
  gridItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
};

const CommonCodePage: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<CodeGroupDisplay | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleGroupSelect = useCallback((group: CodeGroupDisplay | null) => {
    setSelectedGroup(group);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <PageHeader title="공통코드 관리" />

      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="코드 관리" />
        <Tab label="질문 매핑" />
      </Tabs>

      {/* 탭 0: 코드 관리 */}
      {activeTab === 0 && (
        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          {/* Left Panel: 코드그룹 (대분류) */}
          <Grid item xs={12} md={6} sx={styles.gridItem}>
            <CodeGroupSection onGroupSelect={handleGroupSelect} selectedGroup={selectedGroup} />
          </Grid>

          {/* Right Panel: 코드아이템 (소분류) */}
          <Grid item xs={12} md={6} sx={styles.gridItem}>
            <CodeItemSection selectedGroup={selectedGroup} />
          </Grid>
        </Grid>
      )}

      {/* 탭 1: 질문 매핑 */}
      {activeTab === 1 && (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <QuestionMappingSection />
        </Box>
      )}
    </Stack>
  );
};

export default CommonCodePage;
