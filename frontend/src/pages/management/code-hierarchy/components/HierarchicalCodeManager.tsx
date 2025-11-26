import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Box, Grid, SelectChangeEvent } from '@mui/material';
import Section from '@/components/layout/Section';
import { commonCodeMockDb, type CodeType } from '@/mocks/commonCodeDb';
import { hierarchyMockDb } from '@/mocks/hierarchyDb';
import type { GenericCodeItem, HierarchyDefinition } from '../types';
import HierarchyFormDialog from './HierarchyFormDialog';
import LinkDataDialog from './LinkDataDialog';
import HierarchyToolbar from './HierarchyToolbar';
import ParentList from './ParentList';
import ChildList from './ChildList';
import HierarchyInfo from './HierarchyInfo';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const HierarchicalCodeManager: React.FC = () => {
  const [hierarchyDefinitions, setHierarchyDefinitions] = useState<HierarchyDefinition[]>([]);
  const [selectedHierarchy, setSelectedHierarchy] = useState<HierarchyDefinition | null>(null);
  const [parentItems, setParentItems] = useState<GenericCodeItem[]>([]);
  const [childItems, setChildItems] = useState<GenericCodeItem[]>([]);
  const [selectedParentCode, setSelectedParentCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHierarchy, setEditingHierarchy] = useState<HierarchyDefinition | null>(null);
  const [linkDataDialogOpen, setLinkDataDialogOpen] = useState(false);

  const { showAlert } = useAlertDialog();
  const { showConfirm } = useConfirmDialog();

  const loadHierarchies = useCallback(async () => {
    try {
      const hierarchies = await hierarchyMockDb.listAll();
      setHierarchyDefinitions(hierarchies);
      if (!selectedHierarchy && hierarchies.length > 0) {
        setSelectedHierarchy(hierarchies[0]);
      }
    } catch (error) {
      console.error('Failed to load hierarchies:', error);
      showAlert('계층 구조 목록을 불러오는데 실패했습니다.');
    }
  }, [selectedHierarchy, showAlert]);

  const loadData = useCallback(async () => {
    if (!selectedHierarchy) return;

    setLoading(true);
    try {
      const allData = await commonCodeMockDb.listAll();

      // 부모 아이템 필터링 및 변환
      const parents = allData
        .filter((item) => item.code_type === selectedHierarchy.parentType)
        .map((item) => ({
          no: item.no,
          code: item.service_cd,
          name: item.category_nm,
          displayYn: item.status_code,
          sortOrder: item.no,
          codeType: item.code_type,
        }));

      // 자식 아이템 필터링 및 변환
      const children = allData
        .filter((item) => item.code_type === selectedHierarchy.childType)
        .map((item) => ({
          no: item.no,
          code: item.service_cd,
          name: item.category_nm,
          displayYn: item.status_code,
          sortOrder: item.no,
          codeType: item.code_type,
          parentCode: item.parent_service_cd,
        }));

      setParentItems(parents);
      setChildItems(children);
      setSelectedParentCode(null);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedHierarchy]);

  // 초기 로드 및 계층 구조 변경 시 데이터 로드
  useEffect(() => {
    loadHierarchies();
  }, [loadHierarchies]);

  useEffect(() => {
    if (selectedHierarchy) {
      loadData();
    }
  }, [selectedHierarchy, loadData]);

  // 계층 구조 변경
  const handleHierarchyChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const hierarchy = hierarchyDefinitions.find((def) => def.id === event.target.value);
      setSelectedHierarchy(hierarchy || null);
    },
    [hierarchyDefinitions],
  );

  // 계층 구조 등록 다이얼로그 열기
  const handleAddHierarchy = useCallback(() => {
    setEditingHierarchy(null);
    setDialogOpen(true);
  }, []);

  // 계층 구조 수정 다이얼로그 열기
  const handleEditHierarchy = useCallback(() => {
    if (selectedHierarchy) {
      setEditingHierarchy(selectedHierarchy);
      setDialogOpen(true);
    }
  }, [selectedHierarchy]);

  // 계층 구조 저장
  const handleSaveHierarchy = useCallback(
    async (data: Omit<HierarchyDefinition, 'id'>) => {
      try {
        if (editingHierarchy) {
          await hierarchyMockDb.update(editingHierarchy.id, data);
          showAlert('계층 구조가 수정되었습니다.');
        } else {
          await hierarchyMockDb.create(data);
          showAlert('계층 구조가 등록되었습니다.');
        }
        await loadHierarchies();
        setDialogOpen(false);
      } catch (error) {
        throw error;
      }
    },
    [editingHierarchy, showAlert],
  );

  // 계층 구조 삭제
  const handleDeleteHierarchy = useCallback(async () => {
    if (!selectedHierarchy) return;

    const confirmed = await showConfirm(
      `"${selectedHierarchy.parentLabel} → ${selectedHierarchy.childLabel}" 계층 구조를 삭제하시겠습니까?`,
    );

    if (confirmed) {
      try {
        await hierarchyMockDb.delete(selectedHierarchy.id);
        showAlert('계층 구조가 삭제되었습니다.');
        await loadHierarchies();
        setSelectedHierarchy(null);
      } catch (error) {
        showAlert('계층 구조 삭제에 실패했습니다.');
      }
    }
  }, [selectedHierarchy, showConfirm, showAlert]);

  // 데이터 연결 다이얼로그 열기
  const handleLinkData = useCallback(() => {
    setLinkDataDialogOpen(true);
  }, []);

  // 데이터 연결 저장
  const handleLinkDataSave = useCallback(
    async (parentCode: string, childCodes: string[]) => {
      try {
        await commonCodeMockDb.linkChildrenToParent(
          selectedHierarchy!.childGroupCode,
          parentCode,
          childCodes,
        );
        showAlert('데이터 연결이 완료되었습니다.');
        await loadData();
        setLinkDataDialogOpen(false);
      } catch (error) {
        showAlert('데이터 연결에 실패했습니다.');
      }
    },
    [selectedHierarchy, showAlert],
  );

  // 자식 연결 해제
  const handleUnlinkChild = useCallback(
    async (childCode: string) => {
      if (!selectedHierarchy) return;

      const confirmed = await showConfirm('연결을 해제하시겠습니까?');
      if (!confirmed) return;

      try {
        await commonCodeMockDb.update(childCode, {
          code_type: selectedHierarchy.childType as CodeType,
          parent_service_cd: null,
        });
        showAlert('연결이 해제되었습니다.');
        await loadData();
      } catch (error) {
        showAlert('연결 해제에 실패했습니다.');
      }
    },
    [selectedHierarchy, showConfirm, showAlert],
  );

  // 선택된 부모에 속한 자식 필터링
  const filteredChildren = useMemo(() => {
    if (!selectedParentCode) return [];
    return childItems.filter((child) => child.parentCode === selectedParentCode);
  }, [selectedParentCode, childItems]);

  // 부모 아이템 선택
  const handleParentClick = useCallback((code: string) => {
    setSelectedParentCode(code);
  }, []);

  // 참조 무결성 체크
  const canDeleteParent = useCallback(
    (parentCode: string) => {
      const hasChildren = childItems.some((child) => child.parentCode === parentCode);
      return !hasChildren;
    },
    [childItems],
  );

  // 선택된 부모 아이템
  const selectedParent = useMemo(() => {
    return parentItems.find((p) => p.code === selectedParentCode);
  }, [parentItems, selectedParentCode]);

  // 자식 개수 계산
  const getChildCount = useCallback(
    (parentCode: string) => {
      return childItems.filter((child) => child.parentCode === parentCode).length;
    },
    [childItems],
  );

  return (
    <Section>
      <HierarchyToolbar
        hierarchyDefinitions={hierarchyDefinitions}
        selectedHierarchy={selectedHierarchy}
        onHierarchyChange={handleHierarchyChange}
        onAddHierarchy={handleAddHierarchy}
        onEditHierarchy={handleEditHierarchy}
        onDeleteHierarchy={handleDeleteHierarchy}
        onLinkData={handleLinkData}
      />

      {selectedHierarchy && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <ParentList
              selectedHierarchy={selectedHierarchy}
              parentItems={parentItems}
              selectedParentCode={selectedParentCode}
              onParentClick={handleParentClick}
              getChildCount={getChildCount}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <ChildList
              selectedHierarchy={selectedHierarchy}
              selectedParent={selectedParent}
              filteredChildren={filteredChildren}
              onUnlinkChild={handleUnlinkChild}
            />
          </Grid>
        </Grid>
      )}

      <HierarchyInfo selectedHierarchy={selectedHierarchy} />

      <HierarchyFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveHierarchy}
        editData={editingHierarchy}
      />

      <LinkDataDialog
        open={linkDataDialogOpen}
        onClose={() => setLinkDataDialogOpen(false)}
        onSave={handleLinkDataSave}
        selectedHierarchy={selectedHierarchy}
      />
    </Section>
  );
};

export default HierarchicalCodeManager;
