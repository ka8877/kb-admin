// frontend/src/pages/data-reg/recommended-questions/validation/index.ts

/**
 * 추천질문 Validation 모듈 인덱스 파일
 * 공통 validation과 어댑터들을 쉽게 import할 수 있도록 함
 */

// 공통 validation
export { RecommendedQuestionValidator } from './recommendedQuestionValidation';
export type { RecommendedQuestionData } from './recommendedQuestionValidation';

// 어댑터들
export { createRecommendedQuestionYupSchema } from './adapters/yupAdapter';
export { createExcelValidationRules } from './adapters/excelAdapter';
export type { ValidationFunction } from './adapters/excelAdapter';

// 사용 예시:
// import {
//   RecommendedQuestionValidator,
//   createRecommendedQuestionYupSchema,
//   createExcelValidationRules
// } from './validation';
