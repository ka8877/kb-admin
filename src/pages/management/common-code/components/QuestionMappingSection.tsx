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
  useQuestionMappings,
  useSaveQuestionMappings,
} from '../hooks';

/**
 * 질문 매핑 섹션
 * service_cd  qst_ctgr (1:N 매핑)
 * 사용자는 서비스명으로 보고 질문카테고리를 선택
 */
const QuestionMappingSection: React.FC = () => {
  const { showAlert } = useAlertDialog();

  // 데이터 로드
  const { data: serviceCdItems = [] } = useCodeItems({ groupCode: 'service_cd' });
  const { data: qstCtgrItems = [] } = useCodeItems({ groupCode: 'qst_ctgr' });
  const questionCategoryItems = qstCtgrItems;

  const [selectedServiceCode, setSelectedServiceCode] = useState<string | null>(null);
  const [selectedQuestionCodes, setSelectedQuestionCodes] = useState<Set<string>>(new Set());
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 선택된 서비스의 매핑 데이터 조회
  const { data: mappedCategories = [], isLoading: isMappingLoading } = useQuestionMappings(
    selectedServiceCode || undefined
  );

  const saveMappingsMutation = useSaveQuestionMappings();

  // 서비스 목록 (code를 serviceCd로 사용)
  const services = useMemo(() => {
    return serviceCdItems.map((item) => ({
      codeItemId: item.codeItemId,
      serviceCode: item.code, // service_cd의 code가 실제 서비스코드
      serviceName: item.codeName, // codeName이 서비스명
      isActive: item.isActive,
    }));
  }, [serviceCdItems]);

  // 현재 매핑된 질문 카테고리 코드 Set
  const mappedQuestionCodes = useMemo(() => {
    return new Set(mappedCategories.map((cat) => cat.code));
  }, [mappedCategories]);

  // 선택된 서비스에 매핑된 질문 카테고리 codeItemId 목록 (다른 서비스 것 제외)
  const currentMappedItemIds = useMemo(() => {
    return new Set(mappedCategories.map((cat) => cat.codeItemId));
  }, [mappedCategories]);

  // 서비스 선택 시 현재 매핑된 질문 코드로 초기화
  useEffect(() => {
    if (selectedServiceCode && mappedQuestionCodes.size > 0) {
      setSelectedQuestionCodes(new Set(mappedQuestionCodes));
    } else if (selectedServiceCode) {
      setSelectedQuestionCodes(new Set());
    }
  }, [selectedServiceCode, mappedQuestionCodes]);

  const handleServiceSelect = (serviceCode: string) => {
    setSelectedServiceCode(serviceCode);
  };

  const handleQuestionToggle = (questionCode: string, checked: boolean) => {
    setSelectedQuestionCodes((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(questionCode);
      } else {
        newSet.delete(questionCode);
      }
      return newSet;
    });
  };

  const handleApply = async () => {
    if (!selectedServiceCode) return;

    try {
      // 선택된 질문 카테고리 코드 배열로 저장
      const qstCtgrCodes = Array.from(selectedQuestionCodes);

      await saveMappingsMutation.mutateAsync({
        serviceCd: selectedServiceCode,
        data: {
          qstCtgrCodes,
          reason: '질문 카테고리 매핑 업데이트',
        },
      });

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
        item.codeName.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword)
    );
  }, [questionCategoryItems, searchKeyword]);

  const selectedService = services.find((s) => s.serviceCode === selectedServiceCode);
  const hasChanges =
    selectedServiceCode &&
    (selectedQuestionCodes.size !== mappedQuestionCodes.size ||
      Array.from(selectedQuestionCodes).some((code) => !mappedQuestionCodes.has(code)));

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
                key={service.codeItemId}
                variant={selectedServiceCode === service.serviceCode ? 'contained' : 'outlined'}
                onClick={() => handleServiceSelect(service.serviceCode)}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                }}
                subType="etc"
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {service.serviceName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {service.serviceCode}
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
                  {selectedService.serviceName}의 질문 카테고리
                </Typography>
                <MediumButton
                  variant="contained"
                  onClick={handleApply}
                  disabled={!hasChanges || saveMappingsMutation.isPending || isMappingLoading}
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
                    const questionCode = question.code;
                    const isMapped = currentMappedItemIds.has(question.codeItemId);
                    
                    return (
                      <FormControlLabel
                        key={question.codeItemId}
                        control={
                          <Checkbox
                            checked={selectedQuestionCodes.has(questionCode)}
                            onChange={(e) => handleQuestionToggle(questionCode, e.target.checked)}
                            disabled={saveMappingsMutation.isPending || isMappingLoading}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2">
                                {question.codeName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {question.code}
                              </Typography>
                            </Box>
                            {isMapped && (
                              <Chip
                                label="매핑됨"
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
