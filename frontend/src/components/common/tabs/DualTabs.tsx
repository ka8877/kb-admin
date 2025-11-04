import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';

export type DualTabsProps = {
  label1: string;
  label2: string;
  component1: React.ReactNode;
  component2: React.ReactNode;
  defaultTab?: 0 | 1; // 기본 선택 탭
  variant?: 'standard' | 'fullWidth' | 'scrollable';
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dual-tabpanel-${index}`}
      aria-labelledby={`dual-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const DualTabs: React.FC<DualTabsProps> = ({
  label1,
  label2,
  component1,
  component2,
  defaultTab = 0,
  variant = 'standard',
}) => {
  const [activeTab, setActiveTab] = useState<number>(defaultTab);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 탭 헤더 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant={variant} aria-label="dual tabs">
          <Tab label={label1} id="dual-tab-0" aria-controls="dual-tabpanel-0" />
          <Tab label={label2} id="dual-tab-1" aria-controls="dual-tabpanel-1" />
        </Tabs>
      </Box>

      {/* 탭 컨텐츠 */}
      <TabPanel value={activeTab} index={0}>
        {component1}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {component2}
      </TabPanel>
    </Box>
  );
};

export default DualTabs;
