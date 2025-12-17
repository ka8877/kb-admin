import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
  Paper,
  TextField,
  Chip,
} from '@mui/material';
import Section from '@/components/layout/Section';
import MediumButton from '@/components/common/button/MediumButton';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { ALERT_TITLES } from '@/constants/message';
import {
  useCodeItems,
  useServiceMappings,
  useQuestionMappings,
  useCreateQuestionMapping,
  useDeleteQuestionMapping,
} from '../hooks';

/**
 * 질문 매핑 섹션
 * service_cd ↔ qst_ctgr (1:N 매핑)
 * 사용자는 서비스명으로 보고 질문카테고리를 선택
 */
const QuestionMappingSection: React.FC = () => {
  const { showAlert } = useAlertDialog();

  // 데이터 로드
  const { data: allCodeItems = [] } = useCodeItems();
  const serviceCodeItems = allCodeItems.filter((item) => item.group_code === 'service_cd');
  const questionCategoryItems = allCodeItems.filter((item) => item.group_code === 'qst_ctgr');
  const { data: serviceMappings = [] } = useServiceMappings();
  const { data: questionMappings = [] } = useQuestionMappings();

  const createMappingMutation = useCreateQuestionMapping();
  const deleteMappingMutation = useDeleteQuestionMapping();

  const [selectedServiceFirebaseKey, setSelectedServiceFirebaseKey] = useState<string | null>(null);
  const [selectedQuestionKeys, setSelectedQuestionKeys] = useState<Set<string>>(new Set());
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 서비스 목록 (서비스명 포함)
  const services = useMemo(() => {
    return serviceCodeItems.map((item) => {
      // child_code_item_id가 현재 service_cd의 firebaseKey인 매핑 찾기
      const serviceMapping = serviceMappings.find((m) => m.child_code_item_id === item.firebaseKey);

      // parent_code_item_id로 service_nm 찾기
      const serviceNameItem = serviceMapping
        ? allCodeItems.find((ci) => ci.firebaseKey === serviceMapping.parent_code_item_id)
        : null;

      return {
        firebaseKey: item.firebaseKey || '',
        service_code: item.code_name, // service_cd의 code_name이 서비스코드
        service_name: serviceNameItem?.code_name || item.code_name, // service_nm의 code_name이 서비스명
        is_active: item.is_active,
      };
    });
  }, [serviceCodeItems, serviceMappings, allCodeItems]);

  // 선택된 서비스에 매핑된 질문 카테고리 firebaseKey 목록
  const mappedQuestionKeys = useMemo(() => {
    if (!selectedServiceFirebaseKey) return new Set<string>();

    const mapped = questionMappings
      .filter((m) => m.parent_code_item_id === selectedServiceFirebaseKey)
      .map((m) => String(m.child_code_item_id));

    return new Set(mapped);
  }, [selectedServiceFirebaseKey, questionMappings]);

  // 다른 서비스에 매핑된 질문 카테고리 firebaseKey 목록
  const otherServiceMappedKeys = useMemo(() => {
    if (!selectedServiceFirebaseKey) return new Set<string>();

    const otherMapped = questionMappings
      .filter((m) => m.parent_code_item_id !== selectedServiceFirebaseKey)
      .map((m) => String(m.child_code_item_id));

    return new Set(otherMapped);
  }, [selectedServiceFirebaseKey, questionMappings]);

  // 질문 카테고리가 매핑된 서비스명 찾기
  const getQuestionMappedServiceName = (questionKey: string): string | null => {
    const mapping = questionMappings.find(
      (m) =>
        String(m.child_code_item_id) === questionKey &&
        m.parent_code_item_id !== selectedServiceFirebaseKey
    );

    if (!mapping) return null;

    const service = services.find((s) => s.firebaseKey === mapping.parent_code_item_id);
    return service?.service_name || null;
  };

  // 서비스 선택 시 현재 매핑된 질문 목록으로 초기화
  useEffect(() => {
    if (selectedServiceFirebaseKey) {
      setSelectedQuestionKeys(new Set(mappedQuestionKeys));
    }
  }, [selectedServiceFirebaseKey, mappedQuestionKeys]);

  const handleServiceSelect = (serviceFirebaseKey: string) => {
    setSelectedServiceFirebaseKey(serviceFirebaseKey);
  };

  const handleQuestionToggle = (questionFirebaseKey: string, checked: boolean) => {
    setSelectedQuestionKeys((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(questionFirebaseKey);
      } else {
        newSet.delete(questionFirebaseKey);
      }
      return newSet;
    });
  };

  const handleApply = async () => {
    if (!selectedServiceFirebaseKey) return;

    try {
      // 추가할 항목과 삭제할 항목 계산
      const toAdd = Array.from(selectedQuestionKeys).filter((key) => !mappedQuestionKeys.has(key));
      const toDelete = Array.from(mappedQuestionKeys).filter(
        (key) => !selectedQuestionKeys.has(key)
      );

      // 추가
      for (const questionKey of toAdd) {
        await createMappingMutation.mutateAsync({
          mapping_type: 'QUESTION',
          parent_code_item_id: selectedServiceFirebaseKey,
          child_code_item_id: questionKey,
          sort_order: 0,
          is_active: 1,
        });
      }

      // 삭제
      for (const questionKey of toDelete) {
        const mapping = questionMappings.find(
          (m) =>
            m.parent_code_item_id === selectedServiceFirebaseKey &&
            m.child_code_item_id === questionKey
        );

        if (mapping?.firebaseKey) {
          await deleteMappingMutation.mutateAsync(mapping.firebaseKey);
        }
      }

      showAlert({
        title: ALERT_TITLES.SUCCESS,
        message: '질문 매핑이 저장되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to apply question mappings:', error);
      showAlert({
        title: ALERT_TITLES.ERROR,
        message: '질문 매핑 저장에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  // 검색어로 필터링된 질문 카테고리
  const filteredQuestionItems = useMemo(() => {
    if (!searchKeyword.trim()) return questionCategoryItems;

    const keyword = searchKeyword.toLowerCase();
    return questionCategoryItems.filter(
      (item) =>
        item.code_name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword)
    );
  }, [questionCategoryItems, searchKeyword]);

  const selectedService = services.find((s) => s.firebaseKey === selectedServiceFirebaseKey);
  const hasChanges =
    selectedServiceFirebaseKey &&
    (selectedQuestionKeys.size !== mappedQuestionKeys.size ||
      Array.from(selectedQuestionKeys).some((key) => !mappedQuestionKeys.has(key)));

  return (
    <Section title="질문 매핑">
      <Stack direction="row" spacing={2} sx={{ height: 'calc(100vh - 300px)' }}>
        {/* 왼쪽: 서비스 목록 */}
        <Paper sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            서비스 목록
          </Typography>
          <Stack spacing={1}>
            {services.map((service) => (
              <MediumButton
                key={service.firebaseKey}
                variant={
                  selectedServiceFirebaseKey === service.firebaseKey ? 'contained' : 'outlined'
                }
                onClick={() => handleServiceSelect(service.firebaseKey)}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                }}
                subType="etc"
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {service.service_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {service.service_code}
                  </Typography>
                </Box>
              </MediumButton>
            ))}
          </Stack>
        </Paper>

        {/* 오른쪽: 질문 카테고리 선택 */}
        <Paper sx={{ flex: 2, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {selectedService ? (
            <>
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {selectedService.service_name}의 질문 카테고리
                </Typography>
                <MediumButton
                  variant="contained"
                  onClick={handleApply}
                  disabled={
                    !hasChanges ||
                    createMappingMutation.isPending ||
                    deleteMappingMutation.isPending
                  }
                  subType="u"
                >
                  적용
                </MediumButton>
              </Box>
              <TextField
                size="small"
                placeholder="질문 카테고리 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Stack spacing={1}>
                  {filteredQuestionItems.map((question) => {
                    const questionKey = question.firebaseKey || '';
                    const isMappedToOther = otherServiceMappedKeys.has(questionKey);
                    const mappedServiceName = isMappedToOther
                      ? getQuestionMappedServiceName(questionKey)
                      : null;
                    return (
                      <FormControlLabel
                        key={questionKey}
                        control={
                          <Checkbox
                            checked={selectedQuestionKeys.has(questionKey)}
                            onChange={(e) => handleQuestionToggle(questionKey, e.target.checked)}
                            disabled={
                              createMappingMutation.isPending ||
                              deleteMappingMutation.isPending ||
                              isMappedToOther
                            }
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{ color: isMappedToOther ? 'text.disabled' : 'inherit' }}
                              >
                                {question.code_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {question.code}
                              </Typography>
                            </Box>
                            {isMappedToOther && mappedServiceName && (
                              <Chip
                                label={mappedServiceName}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            )}
                          </Box>
                        }
                      />
                    );
                  })}
                </Stack>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                왼쪽에서 서비스를 선택해주세요
              </Typography>
            </Box>
          )}
        </Paper>
      </Stack>
    </Section>
  );
};

export default QuestionMappingSection;
