import React, { useState, useMemo } from 'react';
import { Box, Checkbox, FormControlLabel, Stack, Typography, Paper } from '@mui/material';
import Section from '@/components/layout/Section';
import MediumButton from '@/components/common/button/MediumButton';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { ALERT_TITLES, TOAST_MESSAGES } from '@/constants/message';
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
export default function QuestionMappingSection() {
  const { showAlert } = useAlertDialog();

  // 데이터 로드
  const { data: allCodeItems = [] } = useCodeItems();
  const serviceCodeItems = allCodeItems.filter((item) => item.group_code === 'service_cd');
  const questionCategoryItems = allCodeItems.filter((item) => item.group_code === 'qst_ctgr');
  const { data: serviceMappings = [] } = useServiceMappings();
  const { data: questionMappings = [], isLoading } = useQuestionMappings();

  const createMappingMutation = useCreateQuestionMapping();
  const deleteMappingMutation = useDeleteQuestionMapping();

  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  // 서비스 목록 (서비스명 포함)
  const services = useMemo(() => {
    return serviceCodeItems.map((item) => {
      // child_code_item_id가 현재 service_cd의 code_item_id인 매핑 찾기
      const serviceMapping = serviceMappings.find(
        (m) => m.child_code_item_id === item.code_item_id,
      );

      // parent_code_item_id로 service_nm 찾기
      const serviceNameItem = serviceMapping
        ? allCodeItems.find((ci) => ci.code_item_id === serviceMapping.parent_code_item_id)
        : null;

      return {
        id: item.code_item_id,
        code: item.code,
        code_name: item.code_name,
        service_name: serviceNameItem?.code_name || item.code_name,
        is_active: item.is_active,
      };
    });
  }, [serviceCodeItems, serviceMappings, allCodeItems]);

  // 선택된 서비스에 매핑된 질문 카테고리 ID 목록
  const mappedQuestionIds = useMemo(() => {
    if (!selectedServiceId) return new Set<number>();

    const mapped = questionMappings
      .filter((m) => m.parent_code_item_id === selectedServiceId)
      .map((m) => m.child_code_item_id);

    return new Set(mapped);
  }, [selectedServiceId, questionMappings]);

  const handleServiceSelect = (serviceId: number) => {
    setSelectedServiceId(serviceId);
  };

  const handleQuestionToggle = async (questionCategoryItemId: number, checked: boolean) => {
    if (!selectedServiceId) return;

    try {
      if (checked) {
        // 매핑 생성
        await createMappingMutation.mutateAsync({
          mapping_type: 'QUESTION',
          parent_code_item_id: selectedServiceId,
          child_code_item_id: questionCategoryItemId,
          sort_order: 0,
          is_active: 1,
        });
      } else {
        // 매핑 삭제
        const mapping = questionMappings.find(
          (m) =>
            m.parent_code_item_id === selectedServiceId &&
            m.child_code_item_id === questionCategoryItemId,
        );

        if (mapping?.firebaseKey) {
          await deleteMappingMutation.mutateAsync(mapping.firebaseKey);
        }
      }

      showAlert({
        title: ALERT_TITLES.SUCCESS,
        message: checked ? '질문 카테고리가 추가되었습니다.' : '질문 카테고리가 제거되었습니다.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to toggle question mapping:', error);
      showAlert({
        title: ALERT_TITLES.ERROR,
        message: '질문 매핑 변경에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);

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
                key={service.id}
                variant={selectedServiceId === service.id ? 'contained' : 'outlined'}
                onClick={() => handleServiceSelect(service.id)}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {service.service_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {service.code}
                  </Typography>
                </Box>
              </MediumButton>
            ))}
          </Stack>
        </Paper>

        {/* 오른쪽: 질문 카테고리 선택 */}
        <Paper sx={{ flex: 2, p: 2, overflow: 'auto' }}>
          {selectedService ? (
            <>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                {selectedService.service_name}의 질문 카테고리
              </Typography>
              <Stack spacing={1}>
                {questionCategoryItems.map((question) => (
                  <FormControlLabel
                    key={question.code_item_id}
                    control={
                      <Checkbox
                        checked={mappedQuestionIds.has(question.code_item_id)}
                        onChange={(e) =>
                          handleQuestionToggle(question.code_item_id, e.target.checked)
                        }
                        disabled={
                          createMappingMutation.isPending || deleteMappingMutation.isPending
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{question.code_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {question.code}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
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
}
