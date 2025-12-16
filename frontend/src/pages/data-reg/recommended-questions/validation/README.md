# 추천질문 Validation 가이드

## 📁 구조

```
pages/data-reg/recommended-questions/
├── validation/
│   ├── index.ts                          # validation 모듈 진입점
│   ├── recommendedQuestionValidation.ts  # 공통 validation 규칙
│   └── adapters/
│       ├── yupAdapter.ts                 # 폼용 Yup 어댑터
│       └── excelAdapter.ts               # 엑셀용 어댑터
├── RecommendedQuestionsCreatePage.tsx    # 메인 페이지
└── data.ts                               # 옵션 데이터
```

## 🎯 설계 철학

### ✅ 도메인별 응집성 (Domain Cohesion)

- **추천질문에 관련된 모든 것**이 한 폴더에 모임
- validation, 컴포넌트, 데이터가 **가까운 곳**에 위치
- 다른 도메인과 **명확한 분리**

### ✅ 공통화 + 어댑터 패턴

- **하나의 validation 규칙**으로 폼과 엑셀 모두 처리
- 각 라이브러리에 맞는 **어댑터로 변환**
- 중복 코드 제거, 일관성 보장

## 🔧 사용 방법

### 기본 사용법

```typescript
// 페이지에서 간단하게 import
import { useRecommendedQuestionYupSchema, createExcelValidationRules } from './validation';

// 폼 validation (Hook)
const schema = useRecommendedQuestionYupSchema();

// 엑셀 validation
const validationRules = createExcelValidationRules();
```

### 개별 validation 사용

```typescript
import { useRecommendedQuestionValidator } from './validation';

const { validateServiceName } = useRecommendedQuestionValidator();
const result = validateServiceName('AI 검색');
```

## 🔄 새 필드 추가하기

### 1. 공통 validation에 메서드 추가

```typescript
// recommendedQuestionValidation.ts
static validateNewField(value: any): ValidationResult {
  // validation 로직
}
```

### 2. 어댑터에 규칙 추가

```typescript
// yupAdapter.ts & excelAdapter.ts
new_field: ... // 각각 해당 형식으로 변환
```

## 🏗️ 다른 페이지에 적용하기

이 패턴을 다른 페이지에도 적용할 수 있습니다:

```
pages/data-reg/
├── recommended-questions/
│   └── validation/     ✅ 추천질문 전용
├── other-feature/
│   └── validation/     🔄 다른 기능 전용
└── shared-validation/  🔄 정말 공통인 것들 (선택적)
```

### 장점:

- **응집성**: 관련된 것끼리 모음
- **독립성**: 각 도메인이 독립적으로 발전
- **명확성**: 어떤 validation이 어디에 속하는지 명확
- **확장성**: 새로운 도메인 추가 시 동일한 패턴 적용

## 💡 Best Practices

1. **도메인별로 validation 폴더 생성**
2. **공통 validation 클래스 먼저 정의**
3. **어댑터로 각 라이브러리에 맞게 변환**
4. **index.ts로 깔끔한 import 제공**
5. **README로 사용법 문서화**

이렇게 하면 **"관심사의 분리"**와 **"응집성"**을 모두 만족하는 깔끔한 구조가 됩니다! 🎉
