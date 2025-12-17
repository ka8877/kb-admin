# kabang-admin (Frontend)

본 문서는 **kabang-admin 프론트엔드(SPA)** 의 구조/흐름을 “간단한 설계 문서” 형태로 정리한 README입니다.

- 실행 포트: **5173** (Vite dev/preview)
- 백엔드 연동 포트(로컬 기준): **8080** (Vite dev proxy)
- OS 기준: **Windows / PowerShell**

---

## 1. 목적 / 범위

- 목적: 운영(Admin) 화면을 제공하는 단일 페이지 애플리케이션(SPA) 구축
- 범위: 프론트엔드 아키텍처(라우팅, 인증, 상태관리, API 통신, 환경설정, 빌드) 설명

---

## 2. 기술 스택

- 런타임/빌드
  - React 18 + TypeScript 5
  - Vite 5
- UI
  - MUI(@mui/material) + Emotion
  - (일부) styled-components
  - 공통 Theme: `frontend/src/theme`
- 라우팅
  - React Router 6
- 서버 상태(데이터 패칭)
  - @tanstack/react-query
- 클라이언트 상태
  - Zustand (예: 인증/로딩 상태)
- API 통신
  - Axios (interceptor로 토큰/로딩 처리)
- 인증
  - Keycloak (`keycloak-js`)
- UX 보조
  - react-toastify(알림)
  - Global Dialog / Global Loading Spinner 컴포넌트
- 폼
  - react-hook-form + yup

---

## 3. 실행 방법

### 3.1 개발 실행

```powershell
cd frontend
npm ci
npm run dev  # http://localhost:5173
```

### 3.2 빌드 / 미리보기

```powershell
cd frontend
npm run build     # 산출물: frontend/dist/
npm run preview   # http://localhost:5173
```

### 3.3 린트 / 포맷 / 타입체크

```powershell
cd frontend
npm run lint
npm run format
npm run typecheck
```

---

## 4. 전체 아키텍처 개요

프론트는 아래 흐름으로 동작합니다.

1) **앱 초기화** (`frontend/src/main.tsx`)

- MUI ThemeProvider / CssBaseline 적용
- React Query QueryClientProvider 적용
- React Router BrowserRouter 적용
- ToastContainer(전역 알림) 장착
- `env.auth.enabled` 값에 따라
  - `true` → Keycloak 초기화(`initKeycloak`) 성공 후 렌더
  - `false` → 인증 없이 바로 렌더

2) **라우팅 렌더** (`frontend/src/App.tsx`)

- `<MainLayout>` 내부에서 `<Routes>` 렌더
- `frontRoutes`(라우트 레지스트리)를 순회하여 `<Route>` 구성
- `/login`을 제외한 나머지 페이지는 `<RequireAuth>`로 보호

3) **API 호출**

- Axios 기반 공용 클라이언트(`frontend/src/lib/http.ts`) 사용
- 요청 시 토큰(Authorization Bearer) 자동 부착
- 요청/응답 interceptor로 전역 로딩 상태(start/stop) 자동 반영

---

## 5. 폴더/모듈 구조(요약)

프론트는 `frontend/` 하위에서 관리합니다.

```text
frontend/
  src/
    api/               # 도메인별 API 함수(권장)
    components/        # 공통/도메인 UI 컴포넌트
    config/            # 환경변수/설정(env.ts 등)
    layouts/           # 레이아웃(예: MainLayout)
    lib/               # 공용 유틸/클라이언트(http, query 등)
    pages/             # 라우팅 단위 페이지
    routes/            # 라우팅 레지스트리/메뉴 상수
    store/             # Zustand 스토어(auth, loading 등)
    styles/            # 전역 CSS/변수
    utils/             # 공용 유틸(예: keycloak 초기화)
```

경로 별칭(alias)은 `frontend/vite.config.ts`에 정의되어 있으며, `tsconfig.json`의 paths와 동일하게 유지합니다.

예) `@/config/env`, `@pages/...`, `@api/...`

---

## 6. 라우팅 설계

- 라우트 상수: `frontend/src/routes/menu` (ROUTES)
- 라우트 레지스트리: `frontend/src/routes/registry.ts`
  - `React.lazy()` 기반 코드 스플리팅 적용
- 라우트 렌더링: `frontend/src/App.tsx`
  - `frontRoutes`를 기반으로 `<Route>` 구성
  - `ROUTES.LOGIN`은 예외적으로 인증 가드 미적용
  - 그 외는 `<RequireAuth>`로 보호

---

## 7. 인증(로그인) 설계

### 7.1 토글 가능한 인증 모드

`VITE_AUTH_ENABLED=true`일 때만 Keycloak 로그인을 사용합니다.

- 활성화: `env.auth.enabled === true`
  - `main.tsx`에서 `initKeycloak()` 수행
  - 토큰/사용자 정보를 Zustand 스토어에 저장
- 비활성화: `env.auth.enabled === false`
  - 개발 편의를 위해 즉시 앱 렌더
  - `RequireAuth` 가드도 통과

관련 코드:

- 환경변수 매핑: `frontend/src/config/env.ts`
- Keycloak 초기화/로그인/로그아웃/토큰갱신: `frontend/src/utils/keycloak.ts`
- 인증 가드: `frontend/src/components/guards/RequireAuth.tsx`
- 인증 스토어(Zustand): `frontend/src/store/auth.ts`

---

## 8. 상태 관리 전략

### 8.1 서버 상태(데이터)

- React Query(@tanstack/react-query)를 표준으로 사용
- QueryClient 기본 설정: `frontend/src/lib/query/client.ts`
  - `staleTime=30s`, `refetchOnWindowFocus=false`, `retry=1`

### 8.2 전역 UI 상태

- Zustand 사용
  - 인증 상태: `store/auth.ts`
  - 전역 로딩: `store/loading.ts`
    - Axios interceptor에서 start/stop 호출하여 자동 제어

---

## 9. API 통신 설계

- 공용 Axios 인스턴스: `frontend/src/lib/http.ts`
  - `baseURL = env.apiBaseURL` (기본값: `/api`)
  - `timeout = env.requestTimeout`
  - 요청 interceptor: 토큰 주입 + 전역 로딩 start
  - 응답 interceptor: 전역 로딩 stop + 에러 정규화(ApiError)

로컬 개발 시에는 Vite dev proxy로 `/api → http://localhost:8080` 프록시합니다.

- 설정 위치: `frontend/vite.config.ts`

---

## 10. 환경변수(.env) 규칙

Vite 환경변수는 `VITE_` prefix가 필요합니다.

현재 사용 중인 주요 변수(코드 기준):

- `VITE_API_BASE_URL` (기본 `/api`)
- `VITE_API_TIMEOUT` (기본 `15000`ms)
- `VITE_AUTH_ENABLED` (`true`/`false` 문자열)
- Keycloak
  - `VITE_KEYCLOAK_URL`
  - `VITE_KEYCLOAK_REALM`
  - `VITE_KEYCLOAK_CLIENT_ID`
- 기타
  - `VITE_TEST_URL` (예: 테스트용 Firebase RTDB URL)

매핑 코드: `frontend/src/config/env.ts`

---

## 11. 개발 시 변경 포인트(가이드)

- 신규 페이지 추가
  1) `src/pages/`에 페이지 컴포넌트 추가
  2) `src/routes/menu`에 ROUTES 상수 추가
  3) `src/routes/registry.ts`에 lazy import + `frontRoutes` 등록
- 신규 API 추가
  - `src/api/` 하위에 도메인별 API 모듈 추가
  - 공용 통신은 `src/lib/http.ts`의 `axiosClient`를 사용

---

## 12. 비고

- 본 README는 “프론트 설계 요약”을 목표로 하며, 세부 기능/화면 정의서는 별도 문서로 확장 가능합니다.
- 민감정보(키/비밀번호 등)는 `.env`에만 두고 소스에 하드코딩하지 않습니다.
