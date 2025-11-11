# 프론트엔드 폴더 구조 가이드 (Feature-first)

이 문서는 페이지/도메인(기능) 단위로 코드를 함께 배치하는 "feature-first" 구조를 권장합니다.
코드의 응집도를 높이고, 페이지 단위로 탐색/이해/교체가 쉽도록 하는 것이 목적입니다.

## 상위 구조(frontend/src)

- pages/ — 라우트 단위 페이지(기능별 디렉터리)
- components/ — 전역 공용 UI(여러 기능에서 재사용)
- api/ — 실제 REST 호출 커넥터(axios 래퍼 사용)
- mocks/ — 임시 목 데이터(실서비스 전용 아님)
- lib/ — 공용 유틸/클라이언트(http, query, auth 등)
- store/ — 전역 상태(Zustand)
- styles/ — 전역 스타일
- theme/ — MUI 테마
- types/ — 전역/공용 타입 정의
- layouts/ — 레이아웃(MainLayout 등)
- routes/ — 라우팅/메뉴 등록

GUIDE 핵심: REST 커넥터는 반드시 src/api 하위에 두고, 각 기능 폴더에서는 해당 커넥터를 사용하는 훅/뷰만 둡니다. 목 데이터는 src/mocks에 위치합니다.

---

## 기능(페이지) 단위 폴더 구조

예) pages/example/

- index.tsx — 페이지 조합/레이아웃만 담당(데이터 로딩, 폼/리스트 컴포넌트 조립)
- components/ — 해당 기능 전용 UI 컴포넌트(다이얼로그, 카드, 툴바 등)
  - UiSamples.tsx — (예시) 토스트/컨펌/CSV/새로고침 테스트 UI
- form/ — React Hook Form 기반 폼(검증/제출 로직 포함)
  - CreateForm.tsx
- columns/ — DataGrid 컬럼 정의(표 형태 설정만)
  - index.ts
- hooks/ — 기능 전용 훅(React Query 래핑, 뷰 상태 훅 등)
  - useExampleList.ts
  - useCreateExample.ts
- schemas/ — 폼/도메인 검증 스키마(Yup 등)
- constants.ts — 기능 상수
- utils.ts — 기능 유틸(포맷터 등)
- types.ts — 기능 한정 타입(범용이면 src/types 로 승격)

선택 디렉터리는 실제 필요 시에만 생성합니다(빈 디렉터리 지양). 구조는 "필요에 따라 얇게" 유지합니다.

### 역할 분리 원칙

- 페이지(index.tsx)
  - 화면 레이아웃과 컴포넌트 배치, 쿼리/뮤테이션 호출 타이밍 결정
  - 복잡한 UI 로직/뷰는 components/로 분리
- components/
  - 입/출력 props가 명확한 재사용 가능한 뷰 컴포넌트
  - 다이얼로그/툴바/카드/표 헤더 등 UI 조각
- form/
  - RHF 컨트롤러/검증/제출 처리. 성공/실패 시 콜백(onCreated 등)으로 상위와 통신
- columns/
  - 테이블(DataGrid) 컬럼 정의만(렌더러 포함 가능). 데이터 로직 없음
- hooks/
  - React Query useQuery/useMutation 래핑, 내부 상태 훅. API는 src/api 에서 import
- schemas/
  - Yup 등 검증 스키마 분리로 폼/서버 재사용성 확보

### API, 타입 배치 규칙

- API 호출은 src/api/\* 에만 둡니다. (기능 폴더에 API 모듈 생성 금지)
- 임시 목 데이터는 src/mocks/\* 에 둡니다. (개발 편의)
- 타입은 공용이면 src/types, 기능 한정이면 pages/<feature>/types.ts에 두되, 중복 방지 위해 공용 전환을 우선 검토합니다.

### 네이밍/코딩 컨벤션(발췌)

- 파일: PascalCase(컴포넌트), camelCase(도우미) 권장
- 컴포넌트/함수: const + 화살표 함수(React.FC)
- import 순서: 외부 → 내부(절대/별칭) → 상대. 미사용 임포트 금지
- commit: Conventional Commits(feat/fix/refactor/chore/docs/test/build/ci)

---

## 예제 페이지에 적용(요약)

현재 pages/example는 다음처럼 구성됩니다.

- pages/example/index.tsx
  - 페이지 조립: 상단 UiSamples, 좌측 CreateForm, 우측 DataGrid
- pages/example/components/UiSamples.tsx
  - 토스트/컨펌/CSV/새로고침 테스트 UI
- pages/example/form/CreateForm.tsx
  - 생성 폼(RHF)
- pages/example/columns/index.ts
  - DataGrid 컬럼

추가가 필요해지면 hooks/, schemas/, constants.ts 등을 같은 폴더에 자연스럽게 확장하세요.
API는 src/api/example/\* 로 유지하며, 훅에서 이를 사용합니다.

---

## 간단 예시 스캐폴드

```tsx
// pages/user/index.tsx
const UserPage: React.FC = () => {
  const list = useUserList(); // hooks/useUserList.ts
  return (
    <>
      <UserToolbar /> {/* components/UserToolbar.tsx */}
      <UserGrid rows={list.data ?? []} /> {/* components/UserGrid.tsx */}
    </>
  );
};
```

```ts
// pages/user/hooks/useUserList.ts
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../api';
export const useUserList = () => useQuery({ queryKey: ['users'], queryFn: userApi.list });
```

필요한 폴더만 추가하며, 페이지가 비대해지면 components/와 hooks/로 수평 분할하는 것을 우선 고려합니다.
