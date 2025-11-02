사내 Admin 초기 단계 레포입니다. 백엔드는 Spring Boot, 프론트엔드는 React + Vite 기반으로 구성되어 있습니다.

---

## 프로젝트 스펙(요약)
- 백엔드: Smurf Framwork,  SpringBoot 3.5.3, Java 21, Gradle 8.12.1, Web/Actuator 의존성
- 프론트엔드: React 18, Vite 5, TypeScript 5, React Router 6, React Query 5, Zustand, MUI v5, MUI DataGrid, axios, react-hook-form
- 실행 포트: 프론트 5173, 백엔드 8080
- OS 기준: Linux (Bash 예시)

---

## 폴더 구조(큰 개념)
- backend/ — Spring Boot 애플리케이션(REST API, Actuator 등)
- frontend/ — Vite + React SPA 소스
- Dockerfile — 컨테이너 빌드 정의

프론트엔드 주요 하위 폴더:
- frontend/src/pages — 라우트 단위 페이지(예: dashboard, example 샘플)
- frontend/src/components — 공용 UI 컴포넌트
- frontend/src/routes — 라우팅 등록/사이드 메뉴
- frontend/src/api — 실제 REST 호출 커넥터(axios 래퍼 사용)
- frontend/src/mocks — 임시 목 데이터(example 샘플에서 사용)
- frontend/src/lib — http 클라이언트, query client 등 공용 라이브러리
- frontend/src/store — Zustand 전역 상태
- frontend/src/styles — 전역 스타일(CSS)
- frontend/src/theme — MUI 테마
- frontend/src/types — 공용 타입 정의
- frontend/src/layouts — 레이아웃(MainLayout 등)

---

...existing code...

## 파일 네이밍 권장(긴 폴더 경로 처리) — 페이지 Index 규칙 (추가)
- 원칙: "마지막 하위 폴더명 + Page" 형태로 간결하게 표기합니다.
  - 형식: PascalCase(LastFolder)Page.tsx
- 예시
  - 경로: frontend/src/pages/data-reg/registration/recommended-questions/
    - 파일: RecommendedQuestionsPage.tsx
    - 라우트: /data-reg/registration/recommended-questions
    - import: import RecommendedQuestionsPage from '../pages/data-reg/registration/recommended-questions';

## components/common 구조 안내 
- components/common 디렉터리는 컴포넌트의 성질(역할)별로 폴더를 나눕니다.
  - 예: layout, form, ui, dataDisplay 등 역할별로 폴더 생성
- 파일명 규칙: 각 컴포넌트 파일은 `~폴더명.tsx` 형태로 작성합니다.
  - 형식 예시: `/spinner/GlobalSpinner.tsx`, `/spinner/InlineSpinner.tsx`
- 


## 로컬 실행
- 백엔드(8080)
  - Bash
    - cd backend
    - ./gradlew bootRun
  - 브라우저: http://localhost:8080

- 프론트엔드(5173)
  - Bash
    - cd frontend
    - npm ci
    - npm run dev
  - 브라우저: http://localhost:5173
  - 기본 API 엔드포인트: http://localhost:8080

---

## 빌드
- 프론트엔드
  - cd frontend && npm run build
  - 산출물: frontend/dist
- 백엔드(JAR)
  - cd backend && ./gradlew build
  - 산출물: backend/build/libs/*.jar

---

## 필수 코드 규칙(요약)
- 포맷/린트
  - Prettier/ESLint/Husky(lint-staged) 적용. 커밋 전 자동 실행
  - 명령: `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run typecheck` (frontend)
- 네이밍
  - 변수/함수: camelCase
  - 컴포넌트/타입/인터페이스: PascalCase
  - 상수: UPPER_SNAKE_CASE
- 함수/컴포넌트
  - `const` + 화살표 함수 사용(선언식 지양), React 컴포넌트는 `React.FC`
- import
  - 외부 라이브러리 → 내부(절대/별칭) → 상대 경로 순서, 미사용 임포트 금지
- 커밋 메시지(간단 규칙)
  - Conventional Commits: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `build`, `ci`
  - 형식: `type(scope): subject` 예) `feat(example): 생성 폼 추가`

---

## 샘플/참고
- 예제 페이지: /example — React Hook Form + React Query + MUI DataGrid 기반 생성/조회(목 데이터 사용)
- 대시보드 예시: /dashboard — React Query로 간단한 API 호출 샘플


---

## 추가 문서
- 프론트엔드 페이지/기능별 폴더 구조 가이드: `frontend/docs/folder-structure.md`
