import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { HierarchyDefinition } from '../types';

interface HierarchyInfoProps {
  selectedHierarchy: HierarchyDefinition | null;
}

const HierarchyInfo: React.FC<HierarchyInfoProps> = ({ selectedHierarchy }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 2, backgroundColor: 'info.light' }}>
        <Typography variant="body2" color="info.dark">
          💡 <strong>계층 구조 관리:</strong> 상단에서 관리할 계층 관계를 선택하거나 새로운 계층
          구조를 등록하세요
          <br />
          📊 <strong>현재 구조:</strong>{' '}
          {selectedHierarchy
            ? `${selectedHierarchy.parentLabel} → ${selectedHierarchy.childLabel}`
            : '선택된 계층 없음'}
          <br />
          ⚠️ <strong>참조 무결성:</strong> 하위 항목이 있는 상위 항목은 삭제할 수 없습니다
          <br />➕ <strong>새 계층 추가:</strong> "계층 구조 등록" 버튼을 클릭하여 새로운 부모-자식
          관계를 정의하세요
        </Typography>
      </Paper>
    </Box>
  );
};

export default HierarchyInfo;
