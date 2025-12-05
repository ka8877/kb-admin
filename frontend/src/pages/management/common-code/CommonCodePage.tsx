import React, { useState, useCallback } from 'react';
import { Grid, Stack } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import type { CodeGroupDisplay } from './types';
import CodeGroupSection from './components/CodeGroupSection';
import CodeItemSection from './components/CodeItemSection';

export default function CommonCodePage() {
  const [selectedGroup, setSelectedGroup] = useState<CodeGroupDisplay | null>(null);

  const handleGroupSelect = useCallback((group: CodeGroupDisplay | null) => {
    setSelectedGroup(group);
  }, []);

  // 스타일 정의
  const styles = {
    gridItem: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
  };

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <PageHeader title="공통코드 관리" />
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
    </Stack>
  );
}
